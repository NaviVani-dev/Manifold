use std::env;
use std::process::Command;
use std::thread;

#[tauri::command]
pub async fn execute_application(command: String, user: String) -> Result<String, String> {
    let current_uid = unsafe { libc::getuid() };
    let target_uid: u32 = user.parse().map_err(|_| "Invalid UID format".to_string())?;

    let cmd = command.clone();
    let uid_str = user.clone();

    thread::spawn(move || {
        if current_uid == target_uid {
            execute_as_current_user(&cmd);
        } else {
            execute_as_other_user(&cmd, &uid_str);
        }
    });

    Ok(format!(
        "Application '{}' launched for user {}",
        command, user
    ))
}

fn execute_as_current_user(command: &str) {
    let _ = Command::new("sh").arg("-c").arg(command).spawn();
}

fn execute_as_other_user(command: &str, uid: &str) {
    let resolved_command = resolve_command_path(command);

    if let Ok(_display) = env::var("DISPLAY") {
        let _ = Command::new("xhost")
            .arg(format!(
                "+si:localuser:{}",
                get_username_from_uid(uid).unwrap_or_default()
            ))
            .output();
    }

    let machinectl_cmd = format!(
        "machinectl shell --uid={} --setenv=DISPLAY={} .host {}",
        uid,
        env::var("DISPLAY").unwrap_or(":0".to_string()),
        resolved_command
    );

    let _ = Command::new("pkexec")
        .arg("sh")
        .arg("-c")
        .arg(&machinectl_cmd)
        .spawn();
}

fn get_username_from_uid(uid: &str) -> Option<String> {
    Command::new("id")
        .arg("-nu")
        .arg(uid)
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                None
            }
        })
}

fn resolve_command_path(command: &str) -> String {
    if command.starts_with('/') {
        return command.to_string();
    }

    let parts: Vec<&str> = command.split_whitespace().collect();
    if parts.is_empty() {
        return command.to_string();
    }

    let cmd_name = parts[0];
    let args = if parts.len() > 1 {
        format!(" {}", parts[1..].join(" "))
    } else {
        String::new()
    };

    if let Ok(output) = Command::new("which").arg(cmd_name).output() {
        if output.status.success() {
            let full_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return format!("{}{}", full_path, args);
        }
    }

    command.to_string()
}
