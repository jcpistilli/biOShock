/*
 Memory Manager

 Jonathan Pistilli
 */

module biOShock
{
    export class memoryManager
    {
        //creating memory
        public memory = new Memory(_memSize);
        public loc = new Array(_progNum);


        constructor () {
            for (var i = 0; i < this.loc.length; i++)
            {
                this.loc[i] = {
                    active: false,
                    base: i * _progSize,
                    limit: (i + 1) * _progSize
                };
            }
        }

            //print memory array out to the screen

        public openProgLoc(): any
        {
            for (var i = 0; i < this.loc.length; i++) {
                if (this.loc[i].active === false) {
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

            // Set this location to inactive
            this.loc[location].active = false;
        }

        public loadProgIntoMemory(program, location): void
        {
            var splitProgram = program.split(' '),
                offsetLocation = location * _progSize;
            this.clearProgSect(location);

            for (var i = 0; i < splitProgram.length; i++)
            {
                this.memory.data[i + offsetLocation] = splitProgram[i].toUpperCase();
            }

            // Set this location as active
            this.loc[location].active = true;
        }

        public loadProg (prog): void
        {
            var progLoc = this.openProgLoc;
            if (progLoc !== null)
            {
                var thisPCB = new pcb();
                thisPCB.base = ((progLoc + 1) * _progSize) - _progSize;
                thisPCB.limit= ((progLoc + 1) * _progSize) - 1;

                this.loadProgIntoMemory(prog, progLoc)
            }
        }

    }
}
