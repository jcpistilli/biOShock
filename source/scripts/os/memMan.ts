/*
 Memory Manager

 Jonathan Pistilli
 */

module biOShock
{
    export class memoryManager
    {
        //creating memory

        public memory: any = new Memory(_progSize);
        public loc: any = new Array(_progNum);


        constructor () {
            for (var i = 0; i < this.loc.length; i++)
            {
                this.loc[i] =
                {
                    active: false,
                    base: i * _progSize,
                    limit: (i + 1) * _progSize
                };
            }
        }

            //print memory array out to the screen??

        public eraseSegment(location): void
        {
            for (var x = this.loc[location].base; x < this.loc[location].limit; x++)
            {

                this.memory.data[x] = "00";
            }
        }

        public openProgLoc(): any
        {
            for (var i = 0; i < this.loc.length; i++)
            {
                if (this.loc[i].active == false)
                {
                    this.eraseSegment(i);
                    return i;
                }
            }
            return null;
        }

        public clearProgSect (location)
        {
            var offsetLocation = location * _progSize;

            for (var i = 0; i < _progSize; i++)
            {
                this.memory.data[i + offsetLocation] = "00";
            }

            this.loc[location].active = false;
        }

        public loadProgIntoMemory(program, location): void
        {
            var splitProgram = program.split(' '),
                offsetLocation = location * _progSize;
//            this.clearProgSect(location);

            for (var i = 0; i < splitProgram.length; i++)
            {
                this.memory.data[i + offsetLocation] = splitProgram[i].toUpperCase();
            }

            // Set this.loc to active
            this.loc[location].active = true;
        }

        public loadProg (prog)
        {
            var progLoc = this.openProgLoc();
            if (progLoc === null)
            {
                _StdOut.putText("Memory is full.");
                return null;
            }
            else
            {
                var thisPCB = new pcb();
                thisPCB.base  = ((progLoc + 1) * _progSize) - _progSize;
                thisPCB.limit = ((progLoc + 1) * _progSize) - 1;

                thisPCB.loc = progLoc;

                this.loadProgIntoMemory(prog, progLoc);

                _ResidentList[thisPCB.pid] =
                {
                    pcb: thisPCB,
                    state: "NEW"
                }
            }
            return thisPCB.pid
        }

        public getMemFromLoc (address): any
        {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base)
            {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            return this.memory.data[address];
        }

        public removeFromList (): any
        {
            this.loc[_currProgram.pcb.location].active = false;
            this.clearProgSect(_currProgram.pcb.location);
        }

        public updateMemoryAt(data, address): void
        {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base)
            {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            if (data.length <= 1) {
                data = ("00" + data).slice(-2);
            }

            this.memory.data[address] = data.toUpperCase();
//            this.updateScreen(address);       Use this for printing to the screen
        }

        public resetMemory ()
        {
            _Memory.init();
        }


    }

        //Going to have to display memory at some point

/*        public displayMem(): void
        {

        }
*/
}
