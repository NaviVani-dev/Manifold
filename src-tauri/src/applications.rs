use base64::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
extern crate dirs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationData {
    pub name: String,
    pub description: String,
    pub comment: String,
    pub icon: String,
    pub environment_variables: String,
    pub executable: String,
    pub arguments: String,
}

#[tauri::command]
pub async fn get_apps_folder() -> Result<Vec<ApplicationData>, String> {
    let mut apps: HashMap<String, ApplicationData> = HashMap::new();
    let user_apps = format!(
        "{}/.local/share/applications",
        dirs::home_dir().unwrap_or_default().to_string_lossy()
    );
    let desktop_dirs = vec![
        "/usr/share/applications",
        "/usr/local/share/applications",
        "/var/lib/flatpak/exports/share/applications",
        "/var/lib/snapd/desktop/applications",
        &user_apps,
    ];

    for dir in desktop_dirs {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                if let Some(extension) = entry.path().extension() {
                    if extension == "desktop" {
                        if let Ok(app_info) = parse_desktop_file(&entry.path()).await {
                            let key = app_info.name.clone();

                            if !apps.contains_key(&key)
                                || (apps[&key].description.is_empty()
                                    && !app_info.description.is_empty())
                            {
                                apps.insert(key, app_info);
                            }
                        }
                    }
                }
            }
        }
    }

    let mut result: Vec<ApplicationData> = apps.into_values().collect();
    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(result)
}

async fn parse_desktop_file(path: &Path) -> Result<ApplicationData, String> {
    let content = fs::read_to_string(path).map_err(|e| format!("Error leyendo archivo: {}", e))?;

    let mut name = String::new();
    let mut description = String::new();
    let mut comment = String::new();
    let mut exec = String::new();
    let mut icon_path = String::new();
    let mut env_vars = String::new();
    let mut no_display = false;
    let mut hidden = false;

    let mut in_desktop_entry = false;

    for line in content.lines() {
        let line = line.trim();

        if line == "[Desktop Entry]" {
            in_desktop_entry = true;
            continue;
        }

        if line.starts_with('[') && line != "[Desktop Entry]" {
            in_desktop_entry = false;
            continue;
        }

        if !in_desktop_entry || line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            match key {
                "Name" => name = value.to_string(),
                "GenericName" => {
                    if description.is_empty() {
                        description = value.to_string();
                    }
                }
                "Comment" => comment = value.to_string(),
                "Exec" => exec = value.to_string(),
                "Icon" => icon_path = value.to_string(),
                "Env" => env_vars = value.to_string(),
                "NoDisplay" => no_display = value.to_lowercase() == "true",
                "Hidden" => hidden = value.to_lowercase() == "true",
                _ => {}
            }
        }
    }

    if no_display || hidden || name.is_empty() || exec.is_empty() {
        return Err("Aplicación no válida para mostrar".to_string());
    }

    let (executable, arguments) = parse_exec_command(&exec);

    let icon_result = if !icon_path.is_empty() {
        get_icon_with_conversion(&icon_path)
    } else {
        String::new()
    };

    Ok(ApplicationData {
        name,
        description,
        comment,
        icon: icon_result,
        environment_variables: env_vars,
        executable,
        arguments,
    })
}

fn parse_exec_command(exec: &str) -> (String, String) {
    let cleaned = exec
        .replace("%f", "")
        .replace("%F", "")
        .replace("%u", "")
        .replace("%U", "")
        .replace("%d", "")
        .replace("%D", "")
        .replace("%n", "")
        .replace("%N", "")
        .replace("%i", "")
        .replace("%c", "")
        .replace("%k", "")
        .replace("%v", "")
        .replace("%m", "");

    let mut parts = Vec::new();
    let mut current_part = String::new();
    let mut in_quotes = false;
    let mut chars = cleaned.chars().peekable();

    while let Some(ch) = chars.next() {
        match ch {
            '"' => {
                in_quotes = !in_quotes;
            }
            ' ' if !in_quotes => {
                if !current_part.is_empty() {
                    parts.push(current_part.trim().to_string());
                    current_part.clear();
                }
            }
            '\\' if in_quotes => {
                if let Some(next_ch) = chars.next() {
                    current_part.push(next_ch);
                }
            }
            _ => {
                current_part.push(ch);
            }
        }
    }

    if !current_part.is_empty() {
        parts.push(current_part.trim().to_string());
    }

    if parts.is_empty() {
        return (String::new(), String::new());
    }

    let executable = parts[0].clone();
    let arguments = if parts.len() > 1 {
        parts[1..].join(" ")
    } else {
        String::new()
    };

    (executable, arguments)
}

fn get_icon_with_conversion(icon_path: &str) -> String {
    // Si es una ruta absoluta, verificar que existe
    if icon_path.starts_with('/') {
        if Path::new(icon_path).exists() {
            return convert_icon_if_needed(icon_path);
        } else {
            return String::new();
        }
    }

    // Si no es ruta absoluta, buscar usando el sistema de temas
    if let Some(found_path) = find_themed_icon(icon_path) {
        convert_icon_if_needed(&found_path)
    } else {
        String::new()
    }
}

fn convert_icon_if_needed(icon_path: &str) -> String {
    if icon_path.ends_with(".svg") {
        // Convertir SVG a base64
        if let Ok(svg_content) = fs::read(icon_path) {
            let base64_content = BASE64_STANDARD.encode(&svg_content);
            format!("data:image/svg+xml;base64,{}", base64_content)
        } else {
            icon_path.to_string()
        }
    } else {
        // Para otros formatos, devolver la ruta
        icon_path.to_string()
    }
}

fn get_current_icon_theme() -> String {
    if let Ok(kde_theme) = std::env::var("KDE_SESSION_VERSION") {
        if !kde_theme.is_empty() {
            if let Ok(content) = fs::read_to_string(&format!(
                "{}/.config/kdeglobals",
                dirs::home_dir().unwrap_or_default().to_string_lossy()
            )) {
                for line in content.lines() {
                    if line.starts_with("Theme=") {
                        return line.replace("Theme=", "").trim().to_string();
                    }
                }
            }
        }
    }

    if let Ok(output) = std::process::Command::new("gsettings")
        .args(&["get", "org.gnome.desktop.interface", "icon-theme"])
        .output()
    {
        if output.status.success() {
            let theme = String::from_utf8_lossy(&output.stdout)
                .trim()
                .trim_matches('\'')
                .trim_matches('"')
                .to_string();
            if !theme.is_empty() && theme != "null" {
                return theme;
            }
        }
    }

    let gtk_configs = vec![
        format!(
            "{}/.config/gtk-3.0/settings.ini",
            dirs::home_dir().unwrap_or_default().to_string_lossy()
        ),
        format!(
            "{}/.config/gtk-4.0/settings.ini",
            dirs::home_dir().unwrap_or_default().to_string_lossy()
        ),
        format!(
            "{}/.gtkrc-2.0",
            dirs::home_dir().unwrap_or_default().to_string_lossy()
        ),
    ];

    for config_path in gtk_configs {
        if let Ok(content) = fs::read_to_string(&config_path) {
            for line in content.lines() {
                if line.contains("gtk-icon-theme-name") {
                    if let Some(theme) = line.split('=').nth(1) {
                        let theme = theme.trim().trim_matches('"').trim_matches('\'');
                        if !theme.is_empty() {
                            return theme.to_string();
                        }
                    }
                }
            }
        }
    }

    // Tema por defecto
    "hicolor".to_string()
}

fn get_icon_theme_inheritance(theme_name: &str) -> Vec<String> {
    let mut themes = vec![theme_name.to_string()];

    let possible_paths = vec![
        format!("/usr/share/icons/{}/index.theme", theme_name),
        format!(
            "{}/.local/share/icons/{}/index.theme",
            dirs::home_dir().unwrap_or_default().to_string_lossy(),
            theme_name
        ),
        format!(
            "{}/.icons/{}/index.theme",
            dirs::home_dir().unwrap_or_default().to_string_lossy(),
            theme_name
        ),
    ];

    for path in possible_paths {
        if let Ok(content) = fs::read_to_string(&path) {
            for line in content.lines() {
                if line.starts_with("Inherits=") {
                    let inherits = line.replace("Inherits=", "");
                    for parent_theme in inherits.split(',') {
                        let parent_theme = parent_theme.trim();
                        if !parent_theme.is_empty() && !themes.contains(&parent_theme.to_string()) {
                            themes.push(parent_theme.to_string());
                        }
                    }
                    break;
                }
            }
            break;
        }
    }

    if !themes.contains(&"hicolor".to_string()) {
        themes.push("hicolor".to_string());
    }

    themes
}

fn find_themed_icon(icon_name: &str) -> Option<String> {
    let current_theme = get_current_icon_theme();
    let theme_hierarchy = get_icon_theme_inheritance(&current_theme);

    let base_dirs = vec![
        format!(
            "{}/.local/share/icons",
            dirs::home_dir().unwrap_or_default().to_string_lossy()
        ),
        format!(
            "{}/.icons",
            dirs::home_dir().unwrap_or_default().to_string_lossy()
        ),
        "/usr/share/icons".to_string(),
        "/usr/local/share/icons".to_string(),
        "/var/lib/flatpak/exports/share/icons".to_string(),
    ];

    let sizes = vec![
        "scalable", "512x512", "256x256", "128x128", "96x96", "72x72", "64x64", "48x48", "32x32",
        "24x24", "22x22", "16x16",
    ];

    let contexts = vec![
        "apps",
        "applications",
        "mimetypes",
        "actions",
        "devices",
        "emblems",
        "emotes",
        "categories",
        "places",
        "status",
    ];

    let extensions = vec!["svg", "png", "xpm", "jpg", "jpeg", "gif"];

    // Buscar en cada tema de la jerarquía
    for theme in &theme_hierarchy {
        for base_dir in &base_dirs {
            let theme_path = format!("{}/{}", base_dir, theme);

            if !Path::new(&theme_path).exists() {
                continue;
            }

            // Buscar en cada tamaño
            for size in &sizes {
                if size == &"scalable" {
                    for context in &contexts {
                        let search_dir = format!("{}/{}/{}", theme_path, size, context);
                        for ext in &extensions {
                            let icon_path = format!("{}/{}.{}", search_dir, icon_name, ext);
                            if Path::new(&icon_path).exists() {
                                return Some(icon_path);
                            }
                        }
                    }
                } else {
                    for context in &contexts {
                        let search_dir = format!("{}/{}/{}", theme_path, size, context);
                        for ext in &extensions {
                            let icon_path = format!("{}/{}.{}", search_dir, icon_name, ext);
                            if Path::new(&icon_path).exists() {
                                return Some(icon_path);
                            }
                        }
                    }
                }
            }

            // También buscar directamente en el directorio del tema
            for context in &contexts {
                let search_dir = format!("{}/{}", theme_path, context);
                for ext in &extensions {
                    let icon_path = format!("{}/{}.{}", search_dir, icon_name, ext);
                    if Path::new(&icon_path).exists() {
                        return Some(icon_path);
                    }
                }
            }
        }
    }

    // Fallback: buscar en pixmaps
    for ext in &extensions {
        let pixmaps_path = format!("/usr/share/pixmaps/{}.{}", icon_name, ext);
        if Path::new(&pixmaps_path).exists() {
            return Some(pixmaps_path);
        }
    }

    None
}
