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

        Cpu.prototype.updateCPU = function () {
            biOShock.Control.CPUid("tdPC", this.PC);
            biOShock.Control.CPUid("tdAccum", this.Acc);
            biOShock.Control.CPUid("tdXReg", this.Xreg);
            biOShock.Control.CPUid("tdYReg", this.Yreg);
            biOShock.Control.CPUid("tdZFlag", this.Zflag);
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            _cycleCounter++;

            var cmd = _MemMan.getMemFromLoc(_currMemSpot, this.PC);

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
            var one = _MemMan.getMemFromLoc(_currMemSpot, this.PC + 1);
            var two = _MemMan.getMemFromLoc(_currMemSpot, this.PC + 2);

            return biOShock.Utils.hexToDec(two + one);
        };

        // LDA
        // Load constant into the accumulator
        Cpu.prototype.constToAcc = function () {
            this.Acc = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC + 1));
        };

        // LDA
        // Load accumulator from the memory
        Cpu.prototype.loadAccFromMem = function () {
            var loc = this.nextTwoBytes();
            this.Acc = _MemMan.getMemFromLoc(_currMemSpot, loc);
            this.PC += 2;
        };

        // STA
        // Store accumulator into the memory
        Cpu.prototype.storeAccToMem = function () {
            var loc = this.nextTwoBytes();
            _MemMan.updateMemory(_currMemSpot, loc, this.Acc);
            this.PC += 2;
        };

        // ADC
        // Add memory location to accumulator then store into accumulator
        Cpu.prototype.addStoreIntoAcc = function () {
            var loc = this.nextTwoBytes();
            this.Acc += _MemMan.getMemFromLoc(_currMemSpot, loc);
            this.PC += 2;
        };

        // LDX
        // Load constant into xreg
        Cpu.prototype.constToX = function () {
            this.Xreg = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
        };

        // LDX
        // Load xreg from memory
        Cpu.prototype.loadXMem = function () {
            this.Xreg = this.dataNextTwoBytes();
        };

        // LDY
        // Load constant into y-reg
        Cpu.prototype.loadConstToY = function () {
            this.Yreg = biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
        };

        // LDY
        // Load yreg from memory
        Cpu.prototype.loadYMem = function () {
            this.Yreg = this.nextTwoBytes();
        };

        // NOP
        Cpu.prototype.noOperation = function () {
            // There ain't be nothin round here
        };

        Cpu.prototype.dataNextTwoBytes = function () {
            return _MemMan.getMemFromLoc(_currMemSpot, this.nextTwoBytes());
        };

        // CPX
        // Compare xreg to contents of memory
        Cpu.prototype.compareToX = function () {
            var loc = this.dataNextTwoBytes();
            if (parseInt(this.Xreg) === parseInt(loc)) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
        };

        // BNE
        Cpu.prototype.branchNotEqual = function () {
            if (this.Zflag == 0) {
                this.PC += biOShock.Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
                if (this.PC >= _progSize) {
                    this.PC -= _progSize;
                }
            } else {
                this.PC++;
            }
        };

        // INC
        // Increment the next value by one
        Cpu.prototype.incr = function () {
            var loc = this.nextTwoBytes();
            var val = 1 + _MemMan.getMemFromLoc(_currMemSpot, loc);
            _MemMan.updateMemory(_currMemSpot, loc, val);
            this.PC += 2;
        };

        // SYS
        // System call:
        Cpu.prototype.sysCall = function () {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new biOShock.Interrupt(SYSopcodeIRQ, params));
        };

        //to finish a program
        Cpu.prototype.progDone = function () {
            _currPCB.pcb.pc = this.PC;
            _currPCB.pcb.acc = this.Acc;
            _currPCB.pcb.Xreg = this.Xreg;
            _currPCB.pcb.Yreg = this.Yreg;
            _currPCB.pcb.Zflag = this.Zflag;
            _currPCB.printPCB();
            _runningPID = -1;
            _currMemSpot = -1;
        };

        // BRK
        // Break
        Cpu.prototype.breakCall = function () {
            this.isExecuting = false;
            this.progDone();
        };
        return Cpu;
    })();
    biOShock.Cpu = Cpu;
})(biOShock || (biOShock = {}));
