const HID = require('node-hid');
HID.setDriverType('libusb');

const getPercentage = (percentage) => {
    if (percentage > 100) {
        return 100;
    }

    if (percentage < 0) {
        return 0;
    }

    return percentage;
};

const getDevice = (devices, vendorId, productId) => {
    const device = devices.find(device => device.vendorId === vendorId && device.productId === productId && device.usage !== 1);

    if (device) {
        return device;
    }

    return null;
};

const init = () => {
    const devices = HID.devices();

    devices.forEach(deviceObj => {
        const deviceInfo = getDevice(devices, deviceObj.vendorId, deviceObj.productId);

        if (deviceInfo) {
            const device = new HID.HID(deviceInfo.path);

            if (!device) {
                console.log('Could not find device :(');
                process.exit(1);
            }

            device.on('data', (data) => {
                console.log('data', data);
            });

            console.log(device.readSync());
    
            try {
                device.write([0x00]);
                const report = device.readSync();
    
                console.log('report', report);
                console.log(`${report[2]} battery left on your ${deviceInfo.product}`);
            } catch (error) {
                console.log(`Error: Cannot write to ${deviceInfo.product}. Please replug the device.`);
            }
    
            device.close();
        }
    });
};

console.log(init());