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

//        For the screen
        public updateCPU(): void
        {
            biOShock.Control.CPUid("tdPC", this.PC);
            biOShock.Control.CPUid("tdAcc", this.Acc);
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

            var cmd = _MemMan.getMemFromLoc(this.PC);

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
            var one = _MemMan.getMemFromLoc(this.PC++);
            var two = _MemMan.getMemFromLoc(this.PC++);

            var hex = (two + one);

            var decimal = Utils.hexToDec(hex);

            return decimal;
        }

        public dataNextTwoBytes(): any
        {
            return _MemMan.getMemFromLoc(this.nextTwoBytes());
        }

        /*
            LDA
            Load constant into the accumulator
            A9
        */
        private constToAcc(): void
        {
            this.Acc = Utils.hexToDec(_MemMan.getMemFromLoc(this.PC++));
        }

        /*
            LDA
            Load accumulator from the memory
            AD
        */
        private loadAccFromMem(): void
        {
            this.Acc = this.dataNextTwoBytes();
        }

        /*
            STA
            Store accumulator into the memory
            8D
        */
        private storeAccToMem(): void
        {
            _MemMan.updateMemoryAt(this.Acc.toString(16), this.nextTwoBytes());
        }

        /*
            ADC
            Add memory location to accumulator then store into accumulator
            6D
        */
        private addStoreIntoAcc(): void
        {
            this.Acc += Utils.hexToDec(this.dataNextTwoBytes());
        }

        /*
            LDX
            Load constant into xreg
            A2
        */
        private constToX(): void
        {
            this.Xreg = Utils.hexToDec(_MemMan.getMemFromLoc(++this.PC));
        }

        /*
            LDX
            Load xreg from memory
            AE
        */
        private loadXMem(): void
        {
            this.Xreg = this.dataNextTwoBytes();
        }

        /*
            LDY
            Load constant into y-reg
            A0
        */
        private loadConstToY(): void
        {
            this.Yreg = Utils.hexToDec(_MemMan.getMemFromLoc(++this.PC))
        }

        /*
            LDY
            Load yreg from memory
            AC
        */
        private loadYMem(): void
        {
            this.Yreg = this.dataNextTwoBytes();
        }

        /*
            NOP
            No operation
            EA
        */
        private noOperation(): void
        {
            // There ain't be nothin round here
        }

        /*
            CPX
            Compare xreg to contents of memory
            EC
        */
        private compareToX(): void
        {
            var loc = this.dataNextTwoBytes();
            if (parseInt(String(this.Xreg)) === parseInt(loc)) //String() stops it from being mad
            {
                this.Zflag = 1;
            }
            else
            {
                this.Zflag = 0;
            }
        }

        /*
            BNE
            D0
        */
        private branchNotEqual(): void
        {
            if (this.Zflag == 0)
            {
                this.PC += Utils.hexToDec(_MemMan.getMemFromLoc(this.PC++)) + 1;
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

        /*
            INC
            Increment the next value by one
            EE
        */
        private incr(): void
        {
            var loc = this.nextTwoBytes();
            var data = _MemMan.getMemFromLoc(loc);

            data = parseInt(data, 16);
            data++;

            _MemMan.updateMemoryAt(data.toString(16), loc);
        }

        /*
            SYS
            System call:
            FF
        */
        private sysCall(): void
        {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ, params));

        }
        /*
            BRK
            Break
            00
        */
        private breakCall(): void
        {
            _currProgram.pcb.pc = this.PC;
            _currProgram.pcb.acc = this.Acc;
            _currProgram.pcb.xReg = this.Xreg;
            _currProgram.pcb.yReg = this.Yreg;
            _currProgram.pcb.zFlag = this.Zflag;
            _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ, params));
        }
        /*
            Print CPU to the screen
        */
    }
}
