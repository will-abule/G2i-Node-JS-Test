import Joi, { ValidationResult } from "joi";
import { Schema, model } from "mongoose";
import {
  AcronymInterface,
  AcronymUpdateInterface,
} from "../utils/interface/acronym-interface";

const acronymSchema = new Schema(
  {
    acronym: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Acronym = model("Acronym", acronymSchema);

export function validateAcronym(Acronym: AcronymInterface): ValidationResult {
  const schema = Joi.object({
    acronym: Joi.string().required(),
    definition: Joi.string().required(),
  });

  return schema.validate(Acronym);
}

export function validateAcronymForUpdate(
  Acronym: AcronymUpdateInterface
): ValidationResult {
  const schema = Joi.object({
    acronym: Joi.string(),
    definition: Joi.string(),
  });

  return schema.validate(Acronym);
}
