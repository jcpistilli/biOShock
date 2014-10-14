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
            this.initData(size);
        }


        //initialize the array
        public initData(size): void
        {
            var i;

            for (i = 0; i < this.dataSize; i++)
            {
                this.data[i] = "00";
            }
        }

        public memBlock(blockNumber): string[]
        {
            return this.data[blockNumber];
        }

        public clearMem(): void
        {
            this.initData(this.dataSize);
            Control.clearMemTable(this.data.length);
        }

        public isEmpty(): boolean {
            for (var i = 0; i < this.data.length; i++)
            {
                var currData = this.data[i];

                for (var j = 0; j < currData.length; j++)
                {
                    if (currData[j] != "00")
                    {
                        return false;
                    }
                }
            }

            return true;
        }

    }
}