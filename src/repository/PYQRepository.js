import IPYQRepository from "../interface/IPYQRepository.js";
import PYQ from "../schema/PYQ.js";

class PYQRepository extends IPYQRepository {
    async insert(pyqdata){

        // this is jsut creating a new instance of the model and saving it to the database
        // we can also do PyQ.create(pyqdata) which does the same thing
        const pyq=new PYQ(pyqdata);
        return await pyq.save();
    }
    async find(filters){

        // filters is an object which can have any of the fields of the PYQ model
        return await PYQ.find(filters);
    }
}

export default PYQRepository;
