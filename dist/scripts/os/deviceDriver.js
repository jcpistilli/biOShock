/* ------------------------------
DeviceDriver.ts
The "base class" for all Device Drivers.
------------------------------ */
var biOShock;
(function (biOShock) {
    var DeviceDriver = (function () {
        function DeviceDriver(driverEntry, isr) {
            if (typeof driverEntry === "undefined") { driverEntry = null; }
            if (typeof isr === "undefined") { isr = null; }
            this.driverEntry = driverEntry;
            this.isr = isr;
            this.version = '21.12';
            this.status = 'unloaded';
            this.preemptable = false;
        }
        return DeviceDriver;
    })();
    biOShock.DeviceDriver = DeviceDriver;
})(biOShock || (biOShock = {}));
