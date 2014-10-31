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

        //        For the screen
        Cpu.prototype.updateCPU = function () {
            biOShock.Control.CPUid("tdPC", this.PC);
            biOShock.Control.CPUid("tdAcc", this.Acc);
            biOShock.Control.CPUid("tdXReg", this.Xreg);
            biOShock.Control.CPUid("tdYReg", this.Yreg);
            biOShock.Control.CPUid("tdZFlag", this.Zflag);
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            _cycleCounter++;

            var cmd = _MemMan.getMemFromLoc(this.PC);

            switch (cmd) {
                case "A9":
                    this.constToAcc();
                    break;

                case "AD":
                    this.loadAccFromMem();
                    break;

                case "8D":
                    this.storeAccToMem();
                    break;

                case "6D":
                    this.addStoreIntoAcc();
                    break;

                case "A2":
                    this.constToX();
                    break;

                case "AE":
                    this.loadXMem();
                    break;

                case "A0":
                    this.loadConstToY();
                    break;

                case "AC":
                    this.loadYMem();
                    break;

                case "EA":
                    this.noOperation();
                    break;

                case "EC":
                    this.compareToX();
                    break;

                case "D0":
                    this.branchNotEqual();
                    break;

                case "EE":
                    this.incr();
                    break;

                case "FF":
                    this.sysCall();
                    break;

                case "00" || 0:
                    this.breakCall();
                    break;
            }

            this.updateCPU();

            // We don't want this to happen after we do an FF command
            if (this.isExecuting) {
                this.PC++;
            }
        };

        //returns the location of the next time bytes
        Cpu.prototype.nextTwoBytes = function () {
            var one = _MemMan.getMemFromLoc(this.PC++);
            var two = _MemMan.getMemFromLoc(this.PC++);

            var hex = (two + one);

            var decimal = biOShock.Utils.hexToDec(hex);

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
            this.Acc = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(this.PC++));
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
            this.Acc += biOShock.Utils.hexToDec(this.dataNextTwoBytes());
        };

        /*
        LDX
        Load constant into xreg
        A2
        */
        Cpu.prototype.constToX = function () {
            this.Xreg = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(++this.PC));
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
            this.Yreg = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(++this.PC));
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
                this.PC += biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(this.PC++)) + 1;
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
            _KernelInterruptQueue.enqueue(new biOShock.Interrupt(SYS_OPCODE_IRQ, params));
        };
        return Cpu;
    })();
    biOShock.Cpu = Cpu;
})(biOShock || (biOShock = {}));
