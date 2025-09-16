use base64::prelude::*;
use keyvalues_parser::Vdf;
use serde::Serialize;
use std::fs::{self, read, File};
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::Command;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize)]
pub struct SteamAccountData {
    // we fetch the steam decorations in the front, its easier :3
    id: String,
    username: String,
}

#[derive(Serialize)]
pub struct AccountData {
    uid: u32,
    username: String,
    home: String,
    face: Option<String>,
    steam: Vec<SteamAccountData>,
}

#[tauri::command]
pub fn get_username() -> String {
    whoami::username()
}

#[tauri::command]
pub fn fetch_accounts() -> Vec<AccountData> {
    let passwd_file: File = File::open("/etc/passwd").expect("PASSWD NOT AVAILABLE");
    let passwd: BufReader<File> = BufReader::new(passwd_file);

    let shells_file = File::open("/etc/shells").expect("SHELLS NOT AVAILABLE");
    let shells: Vec<String> = BufReader::new(shells_file)
        .lines()
        .filter_map(|line| line.ok())
        .collect();

    let mut users: Vec<AccountData> = Vec::new();

    for account in passwd.lines() {
        if let Ok(account) = account {
            let parts: Vec<&str> = account.split(":").collect();
            if parts.len() >= 7 {
                let uid = parts[2].parse::<u32>();
                let username = parts[0].to_string();
                let home = parts[5].to_string();
                let shell = parts[6].to_string();

                if let Ok(uid) = uid {
                    if uid >= 1000 && shells.iter().any(|s| s == &shell) {
                        let face_path = format!("{}/.face", home);
                        let face = if Path::new(&face_path).exists() {
                            if let Ok(bytes) = read(&face_path) {
                                let face_encoded = BASE64_STANDARD.encode(bytes);
                                Some(format!("data:image/png;base64,{}", face_encoded))
                            } else {
                                None
                            }
                        } else {
                            None
                        };

                        let steam = fetch_steam_data(&home);

                        users.push(AccountData {
                            uid,
                            username,
                            home,
                            face,
                            steam,
                        })
                    }
                }
            }
        }
    }

    users
}

fn fetch_steam_data(user_home: &str) -> Vec<SteamAccountData> {
    let mut steam_accounts: Vec<SteamAccountData> = Vec::new();
    let loginusers_path: String = format!("{}/.steam/steam/config/loginusers.vdf", user_home);

    if !Path::new(&loginusers_path).exists() {
        return steam_accounts;
    }

    // i hate this code
    if let Ok(vdf_content) = fs::read_to_string(&loginusers_path) {
        if let Ok(logged_users) = Vdf::parse(&vdf_content) {
            if let Some(data) = logged_users.value.get_obj() {
                for (user_id, user_data_vec) in data.iter() {
                    if let Some(user_data) = user_data_vec.get(0) {
                        if let Some(user_obj) = user_data.get_obj() {
                            if let Some(persona_name_vec) = user_obj.get("PersonaName") {
                                if let Some(persona_name_value) = persona_name_vec.get(0) {
                                    if let Some(persona_name) = persona_name_value.get_str() {
                                        steam_accounts.push(SteamAccountData {
                                            id: user_id.to_string(),
                                            username: persona_name.to_string(),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    steam_accounts.reverse();
    steam_accounts
}

#[tauri::command]
pub fn create_user(
    handle: tauri::AppHandle,
    folder: String,
    username: String,
) -> Result<String, String> {
    let host = get_username();

    let script_path = handle
        .path()
        .resolve("scripts/createuser", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    let output = Command::new("pkexec")
        .arg(script_path)
        .arg(&host)
        .arg(&username)
        .arg(&folder)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("User {} created at {}", username, folder))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn edit_user(new_username: String, old_username: String) -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg("usermod")
        .arg("-l")
        .arg(&new_username)
        .arg(&old_username)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!(
            "User {} was changed to {}",
            old_username, new_username
        ))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn delete_user(username: String, remove_home: bool) -> Result<String, String> {
    let mut cmd = std::process::Command::new("pkexec");
    cmd.arg("userdel");

    if remove_home {
        cmd.arg("-r");
    }

    cmd.arg(&username);

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("User {} was deleted", username))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
