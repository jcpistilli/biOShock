/*
Memory Manager
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var memoryManager = (function () {
        function memoryManager() {
            //creating memory
            this.memory = new biOShock.Memory(_memSize);
            this.loc = new Array(_progNum);
            for (var i = 0; i < this.loc.length; i++) {
                this.loc[i] = {
                    active: false,
                    base: i * _progSize,
                    limit: (i + 1) * _progSize
                };
            }
        }
        //print memory array out to the screen??
        memoryManager.prototype.openProgLoc = function () {
            for (var i = 0; i < this.loc.length; i++) {
                if (this.loc[i].active === false) {
                    return i;
                }
            }
            return null;
        };

        memoryManager.prototype.clearProgSect = function (location) {
            var offsetLocation = location * _progSize;

            for (var i = 0; i < _progSize; i++) {
                this.memory.data[i + offsetLocation] = "00";
            }

            this.loc[location].active = false;
        };

        memoryManager.prototype.loadProgIntoMemory = function (program, location) {
            var splitProgram = program.split(' '), offsetLocation = location * _progSize;
            this.clearProgSect(location);

            for (var i = 0; i < splitProgram.length; i++) {
                this.memory.data[i + offsetLocation] = splitProgram[i].toUpperCase();
            }

            // Set this location as active
            this.loc[location].active = true;
        };

        memoryManager.prototype.loadProg = function (prog, pri) {
            var progLoc = this.openProgLoc;
            if (progLoc !== null) {
                var thisPCB = new biOShock.pcb();
                thisPCB.base = ((progLoc + 1) * _progSize) - _progSize;
                thisPCB.limit = ((progLoc + 1) * _progSize) - 1;

                this.loadProgIntoMemory(prog, progLoc);
            }
            return thisPCB.pid;
        };

        memoryManager.prototype.getMemFromLoc = function (blockNum, loc) {
            var mem = _Memory.memBlock(blockNum)[loc];

            return mem;
        };

        memoryManager.prototype.updateMemory = function (blockNum, loc, updateCode) {
            var newCodeHex = biOShock.Utils.decToHex(updateCode);

            var blockNow = _Memory.memBlock(blockNum);

            if (newCodeHex.length < 2)
                newCodeHex = "0" + newCodeHex;
            blockNow[loc] = newCodeHex;
            biOShock.Control.updateTable(Math.floor(loc / 8), loc % 8, newCodeHex);
        };
        return memoryManager;
    })();
    biOShock.memoryManager = memoryManager;
})(biOShock || (biOShock = {}));
