import { Acronym } from "../../models/acronym-model";
import { mockDB } from "../../test/mock/db-mock";

export const populateDB = async () => {
  const acronyms = await Acronym.find().limit(1);

  if (acronyms.length === 0) {
    for await (const d of mockDB) {
      const acronym = await Acronym.findOne({ acronym: Object.keys(d)[0] });
      if (!acronym) {
        const acronyms = new Acronym({
          acronym: Object.keys(d)[0],
          definition: Object.values(d)[0],
        });

        await acronyms.save();
      }
    }
  }
};
