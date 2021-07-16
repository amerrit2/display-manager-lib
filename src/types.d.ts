declare module '@hensm/ddcci' {
    function getMonitorList(): string[];
    function getBrightness(monitorId: string): number;
    function _getVCP(monitorId: string, vcpCode: number): [currentValue: number, maxValue: number];
    function _setVCP(monitorId: string, vcpCode: number, value: number): void;
    function _refresh(): void;
}
