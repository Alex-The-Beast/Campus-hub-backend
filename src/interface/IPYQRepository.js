/**
 * IPyQRepository defines the contract for persistence.
 *
 * Methods:
 *   - insert(pyqData): Promise<PyQ>
 *   - find(filters): Promise<Array<PyQ>>
 */
class IPYQRepository {
  async insert(pyqData) {
    throw new Error("Method not implemented.");
  }

  async find(filters) {
    throw new Error("Method not implemented.");
  }
}

export default IPYQRepository;