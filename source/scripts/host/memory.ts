/*
 Memory

 Jonathan Pistilli
 */

module biOShock
{
    export class Memory
    {
        public data = new Array();
        public dataSize = 0;

        constructor (dataSize)
        {
            this.dataSize = dataSize;
            this.initData();
        }


        //initialize the array
        private initData(): void
        {
            var i;
            for (i = 0; i < this.dataSize; i++)
            {
                this.data[i] = "00";
            }
        }

    }
}