import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import * as m from '$lib/paraglide/messages';

async function initMenu() {
  const fileSubmenu = await Submenu.new({
    id: 'file',
    text: m.menu_file(),
  });
  await fileSubmenu.append(await MenuItem.new({
    id: 'exit',
    text: m.menu_file_exit(),
    async action() {
      await getCurrentWindow().close();
    }
  }));
  const menu = await Menu.new({
    items: [fileSubmenu],
  });

  await menu.setAsAppMenu();
}

async function initTauri() {
  await initMenu();
}

initTauri()
  .catch(error => {
    console.error('error initializing tauri', error);
  })