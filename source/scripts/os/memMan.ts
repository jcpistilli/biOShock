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
//                    this.eraseSegment(i);
                    return i;
                }
            }
            return null;
        }


//        public clearProgSect (location)
//        {
//            var offsetLocation = location * _progSize;
//
//            for (var i = 0; i < _progSize; i++)
//            {
//                this.memory.data[i + offsetLocation] = "00";
//            }
//
//            this.loc[location].active = false;
//        }


        public loadProgIntoMemory(program, location): void
        {
            var splitProgram = program.split(' '),
                offsetLocation = location * _progSize;
//            this.clearProgSect(location);

            for (var i = 0; i < splitProgram.length; i++)
            {
                this.memory.data[i + offsetLocation] = splitProgram[i];
            }


            (<HTMLInputElement>document.getElementById("memTable")).value = splitProgram.join(" ");

            // Set this.loc to active
            this.loc[location].active = true;
        }

        public loadProg (prog, priority)
        {
            var progLoc = this.openProgLoc();
            if (progLoc === null)
            {
                var thisPCB = new pcb();
                _StdOut.putText("Memory is full.");
                return null;

                thisPCB.priority = priority;
            }
            else
            {
                var thisPCB = new pcb();
                thisPCB.base  = ((progLoc + 1) * _progSize) - _progSize;
                thisPCB.limit = ((progLoc + 1) * _progSize) - 1;

                thisPCB.loc = progLoc;

                thisPCB.priority = priority;

                this.loadProgIntoMemory(prog, thisPCB.loc);

                _ResidentList[thisPCB.pid] =
                {
                    pcb: thisPCB,
                    state: "NEW"
                };

                return thisPCB.pid;

            }

        }

        public getMemFromLoc(address)
        {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base)
            {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            return this.memory.data[address];
        }

        public getBase(base)
        {
            for (var i = 0; i < this.loc.length; i++) {
                if (this.loc[i].base === base) {
                    return i;
                }
            }
            return -1;
        }

        public removeFromList(pid): any
        {
            var done = false;

            for (var i = 0; i < _ResidentList.length; i++)
            {
                if(_ResidentList[i] && _ResidentList[i].pcb.pid === pid)
                {
                    var thisLoc = this.getBase(_ResidentList[i].pcb.base);
//                    if (_currProgram.pcb.loc !== -1)
//                    {
                    this.loc[thisLoc].active = false;
//                    }
                    _ResidentList.splice(i, 1);
                    done = true;
                }
            }
            return done;
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

        public resetMemory(): void
        {
            for (var i = 0; i < this.memory.bytes; i++)
            {
                this.memory.data[i] = "00";
            }

            for (var i = 0; i < this.loc.length; i++)
            {
                this.loc[i].active = false;
            }
        }

//        public printMemory()
//        {
//            var display = "";
//
//            for (var i = 0; i < this.memory.bytes; i++)
//            display += '<p>';
//            {
//                display += this.memory.data[i];
//            }
//            display += '</p>';
//
//            document.getElementById("memTable").innerHTML = display;
//        }


    }

    //Going to have to display memory at some point

    /*        public displayMem(): void
     {
     }
     */
}