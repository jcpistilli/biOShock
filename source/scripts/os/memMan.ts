/*
 Memory Manager
 Jonathan Pistilli
 */

module biOShock
{
    export class memoryManager
    {

        public memory: any = new Memory(_progSize);
        public loc: any = new Array(_progNum);


        constructor ()
        {
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

        //searches for the next open program location in memory
        public openProgLoc(): any
        {
            for (var i = 0; i < this.loc.length; i++)
            {
                if (this.loc[i].active == false)
                {
                    return i;
                }
            }
            return null;
        }

        //places a program into the specified memory location
        public loadProgIntoMemory(program, location): void
        {
            var splitProgram = program.split(' '),
                offsetLocation = location * _progSize;

            for (var i = 0; i < splitProgram.length; i++)
            {
                this.memory.data[i + offsetLocation] = splitProgram[i];
            }

            (<HTMLInputElement>document.getElementById("memTable")).value = splitProgram.join(" ");

            this.loc[location].active = true;
        }

        //The workhorse
        public loadProg (prog, priority)
        {
            var progLoc = this.openProgLoc();
            //if there are no avalaible spots in memory, the memory is full
            //this is where the file system will come into play
            if (progLoc === null)
            {
                var thisPCB = new pcb();
                _StdOut.putText("Memory is full.");
                return null;

                //unreachable code, would be used for file system
                thisPCB.priority = priority;
            }
            else
            {
                var thisPCB = new pcb();
                //the base is one greater than the location, because arrays
                //multiply that by the size of the program and then subract the size
                thisPCB.base  = ((progLoc + 1) * _progSize) - _progSize;

                //the limit is again, one greater than the location, multiplied by the program size
                //the minus 1 to keep intact the 255 size of programs
                thisPCB.limit = ((progLoc + 1) * _progSize) - 1;

                thisPCB.loc = progLoc;

                //set the priority
                thisPCB.priority = priority;

                //perform the loading of the program in the memory location
                this.loadProgIntoMemory(prog, thisPCB.loc);

                //assign the PCB and set the state to new, which means it is loaded
                _ResidentList[thisPCB.pid] =
                {
                    pcb: thisPCB,
                    state: "NEW"
                };

                //return the pid for the screen
                return thisPCB.pid;

            }

        }

        //gets the program stored at a specific location for the grab function in the cpu
        //grab then takes this program and allows the CPU to decipher the codes
        public getMemFromLoc(address)
        {
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base)
            {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            return this.memory.data[address];
        }

        //used in removing the process from the resident list
        //gets the base of the program because that's all we need to remove it
        public getBase(base)
        {
            for (var i = 0; i < this.loc.length; i++) {
                if (this.loc[i].base === base) {
                    return i;
                }
            }
            return -1;
        }

        //removes the program indicated from the resident list
        public removeFromList(pid): any
        {
            //the boolean tells us if the process was on the list or not
            var done = false;

            //find the specified pid
            for (var i = 0; i < _ResidentList.length; i++)
            {
                if(_ResidentList[i] && _ResidentList[i].pcb.pid === pid)
                {
                    //using getBase
                    var thisLoc = this.getBase(_ResidentList[i].pcb.base);

                    //make the location available to another program
                    this.loc[thisLoc].active = false;

                    //remove from the list and return true because it was found
                    _ResidentList.splice(i, 1);
                    done = true;
                }
            }
            return done;
        }


        public updateMemoryAt(data, address): void
        {
            //puts the data at the given address
            address += _currProgram.pcb.base;
            if (address >= _currProgram.pcb.limit || address < _currProgram.pcb.base)
            {
                _KernelInterruptQueue.enqueue(new Interrupt(MEM_ACCESS_VIOLATION, address));
            }
            if (data.length <= 1)
            {
                data = ("00" + data).slice(-2);
            }

            this.memory.data[address] = data.toUpperCase();
        }

        //erases the programs from memory
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
    }
}