/* ------------
Interrupt.ts
------------ */
var biOShock;
(function (biOShock) {
    var Interrupt = (function () {
        function Interrupt(irq, params) {
            this.irq = irq;
            this.params = params;
        }
        return Interrupt;
    })();
    biOShock.Interrupt = Interrupt;
})(biOShock || (biOShock = {}));
