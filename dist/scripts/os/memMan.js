/*
Memory Manager
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var memoryManager = (function () {
        function memoryManager() {
            //creating memory
            this.memory = new biOShock.Memory(_progSize);
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
        memoryManager.prototype.eraseSegment = function (location) {
            for (var x = this.loc[location].base; x < this.loc[location].limit; x++) {
                this.memory.data[x] = "00";
            }
        };

        memoryManager.prototype.openProgLoc = function () {
            for (var i = 0; i < this.loc.length; i++) {
                if (this.loc[i].active == false) {
                    this.eraseSegment(i);
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

            debugger;

            document.getElementById("memTable").value = splitProgram.join(" ");

            for (var i = 0; i < splitProgram.length; i++) {
                this.memory.data[i + offsetLocation] = splitProgram[i].toUpperCase();
            }

            // Set this.loc to active
            this.loc[location].active = true;
        };

        memoryManager.prototype.loadProg = function (prog) {
            var progLoc = this.openProgLoc();
            if (progLoc === null) {
                _StdOut.putText("Memory is full.");
                return null;
            } else {
                var thisPCB = new biOShock.pcb();
                thisPCB.base = ((progLoc + 1) * _progSize) - _progSize;
                thisPCB.limit = ((progLoc + 1) * _progSize) - 1;

                thisPCB.loc = progLoc;

                this.loadProgIntoMemory(prog, progLoc);

                _ResidentList[thisPCB.pid] = {
                    pcb: thisPCB,
                    state: "NEW"
                };
            }
            return thisPCB.pid;
        };

        memoryManager.prototype.getMemFromLoc = function (address) {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base) {
                _KernelInterruptQueue.enqueue(new biOShock.Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            return this.memory.data[address];
        };

        memoryManager.prototype.removeFromList = function () {
            this.loc[_currProgram.pcb.location].active = false;
            this.clearProgSect(_currProgram.pcb.location);
        };

        memoryManager.prototype.updateMemoryAt = function (data, address) {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base) {
                _KernelInterruptQueue.enqueue(new biOShock.Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            if (data.length <= 1) {
                data = ("00" + data).slice(-2);
            }

            this.memory.data[address] = data.toUpperCase();
            //            this.updateScreen(address);       Use this for printing to the screen
        };

        memoryManager.prototype.resetMemory = function () {
            _Memory.init();
        };
        return memoryManager;
    })();
    biOShock.memoryManager = memoryManager;
})(biOShock || (biOShock = {}));
