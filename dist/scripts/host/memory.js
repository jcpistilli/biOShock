/*
Memory
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var Memory = (function () {
        function Memory(dataSize) {
            this.data = new Array();
            this.dataSize = 0;
            this.dataSize = dataSize;
            this.initData();
        }
        //initialize the array
        Memory.prototype.initData = function () {
            var i;
            for (i = 0; i < this.dataSize; i++) {
                this.data[i] = "00";
            }
        };
        return Memory;
    })();
    biOShock.Memory = Memory;
})(biOShock || (biOShock = {}));
