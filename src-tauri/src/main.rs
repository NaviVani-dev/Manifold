// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// idk if this is useful, since this app is never releasing on windows lmao, just keeping it here in case
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    manifold_lib::run()
}
