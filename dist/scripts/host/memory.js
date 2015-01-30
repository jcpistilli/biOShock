/*
Memory
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var Memory = (function () {
        function Memory(bytes) {
            this.data = new Array();
            this.bytes = 0;
            this.bytes = bytes;
            this.init();
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < 758; i++) {
                this.data[i] = "00";
            }
            document.getElementById("memTable").value = this.data.join(" ");
        };
        return Memory;
    })();
    biOShock.Memory = Memory;
})(biOShock || (biOShock = {}));
