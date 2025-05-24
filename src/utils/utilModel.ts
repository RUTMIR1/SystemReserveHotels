import { RowDataPacket } from "mysql2";
import { querySql } from "../database.js";
import { MissingParameterException } from "../errors/missingParameterError.js";

export interface ValidationExisting{
    success: boolean;
    message: string;
    field: string;
}

export interface ValidationUnique {
    message: string;
    field: string;
  }
  
  export async function validateUniqueFields(
    model: Record<string, string>,
    nameModel: string,
    id: string | undefined = undefined
  ): Promise<ValidationUnique[]> {
    const matchingFields: { key: string; value: string }[] = [];
    const [columns]: [RowDataPacket[], any] = await querySql(`SHOW COLUMNS FROM ${nameModel}`);
    columns.forEach((el: any) => {
      if (el.Key === 'UNI') {
        matchingFields.push({ key: el.Field, value: model[el.Field] });
      }
    });
    if (matchingFields.length === 0) return [];
    if (id) {
      const [existingRows]: [RowDataPacket[], any] = await querySql(`SELECT * FROM ${nameModel} WHERE id = ?`, [id]);
      if (existingRows.length === 0) {
        throw new MissingParameterException(`No record found in ${nameModel} with id: ${id}`, [{field:'nameModel', message:'Error parameter nameModel'}]);
      }
      const existing = existingRows[0];
      for (let i = matchingFields.length - 1; i >= 0; i--) {
        const field = matchingFields[i];
        if (existing[field.key] === field.value) {
          matchingFields.splice(i, 1);
        }
      }
      if (matchingFields.length === 0) return [];
    }
    const whereConditions = matchingFields.map(field => `${field.key} = ?`).join(' OR ');
    const values = matchingFields.map(field => field.value);
    let query = `SELECT ${matchingFields.map(f => f.key).join(', ')}, id FROM ${nameModel} WHERE ${whereConditions}`;
    if (id) {
      query += ` AND id != ?`;
      values.push(id);
    }
    const [rows]: [RowDataPacket[], any] = await querySql(query, values);
    const duplicatedFields: ValidationUnique[] = [];
    if (rows.length > 0) {
      for (const row of rows) {
        for (const field of matchingFields) {
          if (row[field.key] === field.value && !duplicatedFields.find(f => f.field === field.key)) {
            duplicatedFields.push({
              message: `'${field.key}' whit value '${field.value}' Already Exist.`,
              field: field.key
            });
          }
        }
      }
    }
    return duplicatedFields;
  }