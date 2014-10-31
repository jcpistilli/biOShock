/*
 Memory

 Jonathan Pistilli
 */

module biOShock
{
    export class Memory
    {
        public data = new Array();
        public bytes = 0;

        constructor(bytes)
        {
            this.bytes = bytes;
            this.init();
        }

        public init():void
        {
            for (var i = 0; i < this.bytes; i++)
            {
                this.data[i] = "00";
            }
        }
    }
}
