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

        constructor(public PC = 0,
                    public Acc = 0,
                    public Xreg = 0,
                    public Yreg = 0,
                    public Zflag = 0,
                    public isExecuting: boolean = false)
        {

        }

        public setCPU(process): void
        {
            this.PC = process.pcb.pc;
            this.Acc = process.pcb.acc;
            this.Xreg = process.pcb.xReg;
            this.Yreg = process.pcb.yReg;
            this.Zflag = process.pcb.zFlag;
            this.isExecuting = true;
        }


        public updatePCB(): void
        {
            _currProgram.pcb.pc = this.PC;
            _currProgram.pcb.acc = this.Acc;
            _currProgram.pcb.xReg = this.Xreg;
            _currProgram.pcb.yReg = this.Yreg;
            _currProgram.pcb.zFlag = this.Zflag;
        }

        public updateCpu(): void
        {
            if (this.isExecuting)
            {
                this.updatePCB();
                (<HTMLInputElement>document.getElementById("cpu")).value = "PCB: " + _currProgram.pcb.pid + " PC: " + this.PC + " Acc: " + this.Acc + " Xreg: " + this.Xreg + " Yreg: " + this.Yreg + " Zflag: " + this.Zflag;
            }

        }

        public cycle(): void
        {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            _cycleCounter++;
            this.perform(this.grab());
            this.updateCpu();
        }

        public grab(): any
        {
            return _MemMan.getMemFromLoc(this.PC)
        }

        public perform(cmd): void {

            cmd = String(cmd);

            if (cmd === 'A9')
            {
                this.constToAcc();
            }
            else if (cmd === 'AD')
            {
                this.loadAccFromMem();
            }
            else if (cmd === '8D')
            {
                this.storeAccToMem();
            }
            else if (cmd === '6D')
            {
                this.addStoreIntoAcc();
            }
            else if (cmd === 'A2')
            {
                this.constToX();
            }
            else if (cmd === 'AE')
            {
                this.loadXMem();
            }
            else if (cmd === 'A0')
            {
                this.loadConstToY();
            }
            else if (cmd === 'AC')
            {
                this.loadYMem();
            }
            else if (cmd === 'EA')
            {
                this.noOperation();
            }
            else if (cmd === '00')
            {
                this.breakCall();
            }
            else if (cmd === 'EC')
            {
                this.compareToX();
            }
            else if (cmd === 'D0')
            {
                this.branchNotEqual();
            }
            else if (cmd === 'EE')
            {
                this.incr();
            }
            else if (cmd === 'FF')
            {
                this.sysCall();
            }
            else
            {
                _KernelInterruptQueue.enqueue(new Interrupt(UNKNOWN_OPERATION_IRQ));
            }


            this.PC++;

        }

        /*
         LDA
         Load constant into the accumulator
         A9
         */

        private constToAcc(): void
        {
            this.Acc = parseInt(_MemMan.getMemFromLoc(++this.PC), 16);
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
            this.Acc += parseInt(this.dataNextTwoBytes(), 16);
        }

        /*
         LDX
         Load constant into xreg
         A2
         */
        private constToX(): void
        {
            this.Xreg = parseInt(_MemMan.getMemFromLoc(++this.PC), 16);
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
            this.Yreg = parseInt(_MemMan.getMemFromLoc(++this.PC), 16)
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
            if (parseInt(this.Xreg) === parseInt(loc))
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
                this.PC += parseInt(_MemMan.getMemFromLoc(++this.PC), 16) + 1;
                if (this.PC >= _progSize)
                {
                    this.PC -= _progSize;
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
            //var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ/*, params*/));

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
            _KernelInterruptQueue.enqueue(new Interrupt(BREAK_IRQ));
        }
        /*
         Print CPU to the screen
         */


        //returns the location of the next time bytes
        private nextTwoBytes()
        {
            var one = _MemMan.getMemFromLoc(++this.PC);
            var two = _MemMan.getMemFromLoc(++this.PC);

            var hex = (two + one);

            var decimal = parseInt(hex, 16); //hard coding it for look-ability

            return decimal;
        }

        public dataNextTwoBytes()
        {
            return _MemMan.getMemFromLoc(this.nextTwoBytes());
        }
    }
}