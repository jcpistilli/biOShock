/*
 Memory

 Jonathan Pistilli
 */

module biOShock
{
    export class Memory
    {
        data: any = new Array();
        bytes: number = 0;

        constructor(bytes)
        {
            this.bytes = bytes;
            this.init();
        }

        public init(): void
        {
            for (var i = 0; i < this.bytes; i++)
            {
                this.data[i] = "00";
            }
        }
    }
}
