import { v4 as uuidv4 } from 'uuid';

export class Support {
    constructor(data) {
        this.id = uuidv4();
        this.name = data.name || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.type = data.type || '';
        this.priorityLevel = data.priorityLevel || '';
        this.description = data.description || '';
        this.createdAt = new Date().toISOString();
    }

    validate() {
        if (!this.name || !this.email || !this.description || !this.createdAt || !this.phone || !this.type || !this.priorityLevel) {
            throw new Error('Nombre, Email y Descripcion, Fecha de Creacion, Telefono, Tipo y prioridad son obligatorios');
        }
    }
}