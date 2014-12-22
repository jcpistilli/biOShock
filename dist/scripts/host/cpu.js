///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var biOShock;
(function (biOShock) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.resetCPU = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.init = function () {
            this.resetCPU();
        };

        Cpu.prototype.setCPU = function (process) {
            this.PC = process.pcb.pc;
            this.Acc = process.pcb.acc;
            this.Xreg = process.pcb.xReg;
            this.Yreg = process.pcb.yReg;
            this.Zflag = process.pcb.zFlag;
            this.isExecuting = true;
        };

        //        For the screen
        Cpu.prototype.updatePCB = function () {
            _currProgram.pcb.pc = this.PC;
            _currProgram.pcb.acc = this.Acc;
            _currProgram.pcb.xReg = this.Xreg;
            _currProgram.pcb.yReg = this.Yreg;
            _currProgram.pcb.zFlag = this.Zflag;
        };

        Cpu.prototype.updateCpu = function () {
            if (this.isExecuting) {
                this.updatePCB();
                document.getElementById("pcb").value = "PCB: " + _currProgram.pcb.pid + " PC: " + this.PC + " Acc: " + this.Acc + " Xreg: " + this.Xreg + " Yreg: " + this.Yreg + " Zflag: " + this.Zflag;
            }
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            _cycleCounter++;
            this.perform(this.grab());
            this.updateCpu();
        };

        Cpu.prototype.grab = function () {
            return _MemMan.getMemFromLoc(this.PC);
        };

        Cpu.prototype.perform = function (cmd) {
            cmd = String(cmd);

            if (cmd === 'A9') {
                this.constToAcc();
            } else if (cmd === 'AD') {
                this.loadAccFromMem();
            } else if (cmd === '8D') {
                this.storeAccToMem();
            } else if (cmd === '6D') {
                this.addStoreIntoAcc();
            } else if (cmd === 'A2') {
                this.constToX();
            } else if (cmd === 'AE') {
                this.loadXMem();
            } else if (cmd === 'A0') {
                this.loadConstToY();
            } else if (cmd === 'AC') {
                this.loadYMem();
            } else if (cmd === 'EA') {
                this.noOperation();
            } else if (cmd === 'EC') {
                this.compareToX();
            } else if (cmd === 'D0') {
                this.branchNotEqual();
            } else if (cmd === 'EE') {
                this.incr();
            } else if (cmd === 'FF') {
                this.sysCall();
            } else if (cmd === '00') {
                this.breakCall();
            } else {
                var num = biOShock.Utils.hexToDec(cmd);
                var params = [num, 0];
                _KernelInterruptQueue.enqueue(new biOShock.Interrupt(UNKNOWN_OPERATION_IRQ, params));
            }

            this.PC++;
        };

        //returns the location of the next time bytes
        Cpu.prototype.nextTwoBytes = function () {
            var one = _MemMan.getMemFromLoc(this.PC++);
            var two = _MemMan.getMemFromLoc(this.PC++);

            var hex = (two + one);

            var decimal = parseInt(hex, 16);

            return decimal;
        };

        Cpu.prototype.dataNextTwoBytes = function () {
            return _MemMan.getMemFromLoc(this.nextTwoBytes());
        };

        /*
        LDA
        Load constant into the accumulator
        A9
        */
        Cpu.prototype.constToAcc = function () {
            this.Acc = parseInt(_MemMan.getMemFromLoc(++this.PC), 16);
        };

        /*
        LDA
        Load accumulator from the memory
        AD
        */
        Cpu.prototype.loadAccFromMem = function () {
            this.Acc = this.dataNextTwoBytes();
        };

        /*
        STA
        Store accumulator into the memory
        8D
        */
        Cpu.prototype.storeAccToMem = function () {
            _MemMan.updateMemoryAt(this.Acc.toString(16), this.nextTwoBytes());
        };

        /*
        ADC
        Add memory location to accumulator then store into accumulator
        6D
        */
        Cpu.prototype.addStoreIntoAcc = function () {
            this.Acc += parseInt(this.dataNextTwoBytes(), 16);
        };

        /*
        LDX
        Load constant into xreg
        A2
        */
        Cpu.prototype.constToX = function () {
            this.Xreg = parseInt(_MemMan.getMemFromLoc(++this.PC), 16);
        };

        /*
        LDX
        Load xreg from memory
        AE
        */
        Cpu.prototype.loadXMem = function () {
            this.Xreg = this.dataNextTwoBytes();
        };

        /*
        LDY
        Load constant into y-reg
        A0
        */
        Cpu.prototype.loadConstToY = function () {
            this.Yreg = parseInt(_MemMan.getMemFromLoc(++this.PC), 16);
        };

        /*
        LDY
        Load yreg from memory
        AC
        */
        Cpu.prototype.loadYMem = function () {
            this.Yreg = this.dataNextTwoBytes();
        };

        /*
        NOP
        No operation
        EA
        */
        Cpu.prototype.noOperation = function () {
            // There ain't be nothin round here
        };

        /*
        CPX
        Compare xreg to contents of memory
        EC
        */
        Cpu.prototype.compareToX = function () {
            var loc = this.dataNextTwoBytes();
            if (parseInt(String(this.Xreg)) === parseInt(loc)) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
        };

        /*
        BNE
        D0
        */
        Cpu.prototype.branchNotEqual = function () {
            if (this.Zflag == 0) {
                this.PC += parseInt(_MemMan.getMemFromLoc(this.PC++), 16) + 1;
                if (this.PC >= _progSize) {
                    this.PC -= _progSize;
                }
            } else {
                this.PC++;
            }
        };

        /*
        INC
        Increment the next value by one
        EE
        */
        Cpu.prototype.incr = function () {
            var loc = this.nextTwoBytes();
            var data = _MemMan.getMemFromLoc(loc);

            data = parseInt(data, 16);
            data++;

            _MemMan.updateMemoryAt(data.toString(16), loc);
        };

        /*
        SYS
        System call:
        FF
        */
        Cpu.prototype.sysCall = function () {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new biOShock.Interrupt(SYS_OPCODE_IRQ, params));
        };

        /*
        BRK
        Break
        00
        */
        Cpu.prototype.breakCall = function () {
            _currProgram.pcb.pc = this.PC;
            _currProgram.pcb.acc = this.Acc;
            _currProgram.pcb.xReg = this.Xreg;
            _currProgram.pcb.yReg = this.Yreg;
            _currProgram.pcb.zFlag = this.Zflag;
            //_KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ), params);
        };
        return Cpu;
    })();
    biOShock.Cpu = Cpu;
})(biOShock || (biOShock = {}));
