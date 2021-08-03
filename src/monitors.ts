import { _getVCP as getVCP, getMonitorList, _setVCP as setVCP } from '@hensm/ddcci';
import { sleep } from './util';
import { VcpCodes } from './vcp';


enum InputSource {
    HDMI_1 = 0,
    DVI = 17,
}

export async function flipInput(monId: string) {
    const newInput = getVCP(monId, VcpCodes.INPUT_SOURCE)[0] === InputSource.DVI ? InputSource.HDMI_1 : InputSource.DVI;

    console.log(`Setting ${monId} to ${newInput}`);
    setVCP(monId, VcpCodes.INPUT_SOURCE, newInput);
    await sleep(500);
}

export async function getAllInputs() {
    return getMonitorList().reduce((out, mon) => {
        try {
            out[mon] = getVCP(mon, VcpCodes.INPUT_SOURCE)[0];
        } catch (e) {
            console.error(`VCP fetch failed: ${e.message}`);
        }
        return out;
    }, {} as { [id: string]: number });
}

export async function flipAllMonitors() {
    return Promise.all(getMonitorList().map((mon) => flipInput(mon)));
}