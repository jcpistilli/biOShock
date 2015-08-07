/*
File System
Jonathan Pistilli
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var biOShock;
(function (biOShock) {
    var fileSystem = (function (_super) {
        __extends(fileSystem, _super);
        function fileSystem() {
            _super.call(this, this.krnFileSystemDriverEntry, this.krnFileSystemISR);
            this.tracks = 0;
            this.sectors = 0;
            this.blocks = 0;
        }
        fileSystem.prototype.krnFileSystemDriverEntry = function () {
            this.status = "file system loaded";
        };

        fileSystem.prototype.krnFileSystemISR = function () {
        };
        return fileSystem;
    })(biOShock.DeviceDriver);
    biOShock.fileSystem = fileSystem;
})(biOShock || (biOShock = {}));
