import joi from "joi";

const birthdaySchema = joi.object({
  name: joi.string().min(3).max(50).required(),
  phone: joi.string().min(10).max(11).required(),
  cpf: joi.string().min(11).max(11).required(),
  birthday:joi.date().required()
});

export default birthdaySchema;
