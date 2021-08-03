import { windowManager } from 'node-window-manager';

export async function getWindowConfiguration() {
    const activeWindow = windowManager.getActiveWindow();
    console.log('Active window: ', {
        ...activeWindow,
        title: activeWindow.getTitle(),
        bounds: activeWindow.getBounds(),
        isWindow: activeWindow.isWindow(),
        isVisible: activeWindow.isVisible(),
    });
    const windows = windowManager
        .getWindows()
        .filter(
            (win) =>
                // (win.isVisible() &&
                //     win.isWindow() &&
                //     win.getBounds().height &&
                //     win.getBounds().width) ||
                win.id === activeWindow.id
        )
        .map((win) => ({
            ...win,
            title: win.getTitle(),
            bounds: win.getBounds(),
            isActive: win.id === activeWindow.id,
            monitor: win.getMonitor(),
            isVisible: win.isVisible(),
        }));
    // .filter((win) => win.title !== '');

    const monitors = windowManager.getMonitors().map((mon) => ({
        ...mon,
        workArea: mon.getWorkArea(),
        bounds: mon.getBounds(),
    }));

    console.log(JSON.stringify({ windows, monitors }, null, 2));
}
