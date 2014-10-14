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
            this.initData(size);
        }
        //initialize the array
        Memory.prototype.initData = function (size) {
            var i;

            for (i = 0; i < this.dataSize; i++) {
                this.data[i] = "00";
            }
        };

        Memory.prototype.memBlock = function (blockNumber) {
            return this.data[blockNumber];
        };

        Memory.prototype.clearMem = function () {
            this.initData(this.dataSize);
            biOShock.Control.clearMemTable(this.data.length);
        };

        Memory.prototype.isEmpty = function () {
            for (var i = 0; i < this.data.length; i++) {
                var currData = this.data[i];

                for (var j = 0; j < currData.length; j++) {
                    if (currData[j] != "00") {
                        return false;
                    }
                }
            }

            return true;
        };
        return Memory;
    })();
    biOShock.Memory = Memory;
})(biOShock || (biOShock = {}));
