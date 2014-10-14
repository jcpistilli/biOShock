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

module biOShock {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false)
        {

        }

        public resetCPU(): void
        {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public init(): void
        {
            this.resetCPU();
        }

        public updateCPU(): void
        {
            biOShock.Control.CPUid("tdPC", this.PC);
            biOShock.Control.CPUid("tdAccum", this.Acc);
            biOShock.Control.CPUid("tdXReg", this.Xreg);
            biOShock.Control.CPUid("tdYReg", this.Yreg);
            biOShock.Control.CPUid("tdZFlag", this.Zflag);
        }

        public cycle(): void
        {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            _cycleCounter++;

            var cmd = _MemMan.getMemFromLoc(_currMemSpot, this.PC);

            //similar to the way we did keyboard symbols
            switch (cmd)
            {
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
            if (this.isExecuting)
            {
                this.PC++;
            }
        }

        //returns the location of the next time bytes
        private nextTwoBytes(): number
        {
            var one = _MemMan.getMemFromLoc(_currMemSpot, this.PC + 1);
            var two = _MemMan.getMemFromLoc(_currMemSpot, this.PC + 2);

            return Utils.hexToDec(two + one);
        }

        // LDA
        // Load constant into the accumulator
        private constToAcc(): void
        {
            this.Acc = Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC + 1));
        }

        // LDA
        // Load accumulator from the memory
        private loadAccFromMem(): void
        {
            var loc = this.nextTwoBytes();
            this.Acc = _MemMan.getMemFromLoc(_currMemSpot, loc);
            this.PC += 2;
        }

        // STA
        // Store accumulator into the memory
        private storeAccToMem(): void
        {
            var loc = this.nextTwoBytes();
            _MemMan.updateMemory(_currMemSpot, loc, this.Acc);
            this.PC += 2;
        }

        // ADC
        // Add memory location to accumulator then store into accumulator
        private addStoreIntoAcc(): void
        {
            var loc = this.nextTwoBytes();
            this.Acc += _MemMan.getMemFromLoc(_currMemSpot, loc);
            this.PC += 2;
        }

        // LDX
        // Load constant into xreg
        private constToX(): void
        {
            this.Xreg = Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
        }

        // LDX
        // Load xreg from memory
        private loadXMem(): void
        {
            this.Xreg = this.dataNextTwoBytes();
        }

        // LDY
        // Load constant into y-reg
        private loadConstToY(): void
        {
            this.Yreg = Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
        }

        // LDY
        // Load yreg from memory
        private loadYMem(): void
        {
            this.Yreg = this.nextTwoBytes();
        }

        // NOP
        private noOperation(): void
        {
            // There ain't be nothin round here
        }

        public dataNextTwoBytes(): any
        {
            return _MemMan.getMemFromLoc(_currMemSpot, this.nextTwoBytes());
        }

        // CPX
        // Compare xreg to contents of memory
        private compareToX(): void
        {
            var loc = this.dataNextTwoBytes();
            if (parseInt(this.Xreg) === parseInt(loc))
            {
                this.Zflag = 1;
            }
            else
            {
                this.Zflag = 0;
            }
        }

        // BNE
        private branchNotEqual(): void
        {
            if (this.Zflag == 0)
            {
                this.PC += Utils.hexToDec(_MemMan.getMemFromLoc(_currMemSpot, this.PC += 1));
                if (this.PC >= _progSize)
                {
                    this.PC -= _progSize
                }
            }
            else
            {
                this.PC++;
            }
        }

        // INC
        // Increment the next value by one
        private incr(): void
        {
            var loc = this.nextTwoBytes();
            var val = 1 + _MemMan.getMemFromLoc(_currMemSpot, loc);
            _MemMan.updateMemory(_currMemSpot, loc, val);
            this.PC += 2;
        }

        // SYS
        // System call:

        private sysCall(): void
        {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new Interrupt(SYSopcodeIRQ, params));

        }

        //to finish a program
        public progDone(): void {
            _currPCB.pcb.pc = this.PC;
            _currPCB.pcb.acc = this.Acc;
            _currPCB.pcb.Xreg = this.Xreg;
            _currPCB.pcb.Yreg = this.Yreg;
            _currPCB.pcb.Zflag = this.Zflag;
            _currPCB.printPCB();
            _runningPID = -1;
            _currMemSpot = -1;
        }

        // BRK
        // Break
        private breakCall(): void {
            this.isExecuting = false;
            this.progDone();
        }
    }
}
