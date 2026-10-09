import type { Request, Response } from "express";
import pool from "../conf/dbConnection.ts";

// Valida que el id sea un entero positivo
const parseId = (value: any): any => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return id > 0 && Number.isSafeInteger(id) ? id : null;
};

// Acepta numero o string numerico, mayor que cero, maximo 2 decimales
// y que quepa en DECIMAL(10, 2)
const isValidPrice = (price: any): boolean => {
  if (typeof price !== "number" && typeof price !== "string") {
    return false;
  }
  if (typeof price === "string" && !price.trim()) {
    return false;
  }
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0 || num > 99999999.99) {
    return false;
  }
  return /^\d+(\.\d{1,2})?$/.test(String(price).trim());
};

// Porcentaje de alcohol: numero entre 0 y 100, maximo 2 decimales
const isValidAlcoholPercentage = (value: any): boolean => {
  if (typeof value !== "number" && typeof value !== "string") {
    return false;
  }
  if (typeof value === "string" && !value.trim()) {
    return false;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 100) {
    return false;
  }
  return /^\d+(\.\d{1,2})?$/.test(String(value).trim());
};

// Valida el cuerpo completo de POST y PUT, regresa el mensaje de error o null
const validateProductBody = (body: any): any => {
  if (!body || typeof body !== "object") {
    return "body must be an object";
  }
  const {
    name,
    price,
    stock,
    description,
    brand,
    img,
    alcohol_percentage,
    alcohol_type,
  } = body;

  if (typeof name !== "string" || !name.trim() || name.length > 50) {
    return "name is required (max 50 characters)";
  }
  if (!isValidPrice(price)) {
    return "price must be a number greater than 0 with up to 2 decimals";
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return "stock must be an integer greater than or equal to 0";
  }
  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 500
  ) {
    return "description is required (max 500 characters)";
  }
  if (
    brand !== undefined &&
    brand !== null &&
    (typeof brand !== "string" || brand.length > 100)
  ) {
    return "brand must be a string (max 100 characters)";
  }
  if (img !== undefined && img !== null && typeof img !== "string") {
    return "img must be a string";
  }
  if (!isValidAlcoholPercentage(alcohol_percentage)) {
    return "alcohol_percentage must be a number between 0 and 100 with up to 2 decimals";
  }
  if (
    typeof alcohol_type !== "string" ||
    !alcohol_type.trim() ||
    alcohol_type.length > 50
  ) {
    return "alcohol_type is required (max 50 characters)";
  }
  return null;
};

export class ProductsController {
  async getAll(req: Request, res: Response) {
    try {
      const active = req.query.active ?? "true";
      if (String(active).toLowerCase() !== "true") {
        res.status(400).json({ message: "only active=true is supported" });
        return;
      }
      const [rows] = await pool.execute(
        "select * from products where active = ?",
        [true],
      );
      res.status(200).json(rows);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id!);
      if (id === null) {
        res.status(400).json({ message: "id must be a positive integer" });
        return;
      }
      const [rows]: any = await pool.execute(
        "select * from products where id = ? and active = ?",
        [id, true],
      );
      if (rows.length === 0) {
        res.status(200).json({ message: "product not found" });
        return;
      }
      res.status(200).json(rows[0]);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const error = validateProductBody(req.body);
      if (error) {
        res.status(400).json({ message: error });
        return;
      }
      const {
        name,
        price,
        stock,
        description,
        brand,
        img,
        alcohol_percentage,
        alcohol_type,
      } = req.body;
      const query = `
        insert into products
          (name, price, stock, description, brand, img, alcohol_percentage, alcohol_type)
        values (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result]: any = await pool.execute(query, [
        name.trim(),
        Number(price),
        stock,
        description.trim(),
        brand ?? null,
        img ?? null,
        Number(alcohol_percentage),
        alcohol_type.trim(),
      ]);
      res
        .status(201)
        .json({ message: "product created", id: result.insertId });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id!);
      if (id === null) {
        res.status(400).json({ message: "id must be a positive integer" });
        return;
      }
      const error = validateProductBody(req.body);
      if (error) {
        res.status(400).json({ message: error });
        return;
      }
      const {
        name,
        price,
        stock,
        description,
        brand,
        img,
        alcohol_percentage,
        alcohol_type,
      } = req.body;
      const query = `
        update products
        set name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ?,
            alcohol_percentage = ?, alcohol_type = ?
        where id = ? and active = ?
      `;
      const [result]: any = await pool.execute(query, [
        name.trim(),
        Number(price),
        stock,
        description.trim(),
        brand ?? null,
        img ?? null,
        Number(alcohol_percentage),
        alcohol_type.trim(),
        id,
        true,
      ]);
      if (result.affectedRows === 0) {
        res.status(200).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: "product updated" });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id!);
      if (id === null) {
        res.status(400).json({ message: "id must be a positive integer" });
        return;
      }
      // baja logica, no se borra la fila
      const [result]: any = await pool.execute(
        "update products set active = ? where id = ? and active = ?",
        [false, id, true],
      );
      if (result.affectedRows === 0) {
        res.status(200).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: `product with id ${id} deactivated` });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async changePrice(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id!);
      if (id === null) {
        res.status(400).json({ message: "id must be a positive integer" });
        return;
      }
      const body: any = req.body;
      if (
        !body ||
        typeof body !== "object" ||
        Object.keys(body).length !== 1 ||
        !("price" in body)
      ) {
        res.status(400).json({ message: "body must contain only price" });
        return;
      }
      if (!isValidPrice(body.price)) {
        res.status(400).json({
          message: "price must be a number greater than 0 with up to 2 decimals",
        });
        return;
      }
      const [result]: any = await pool.execute(
        "update products set price = ? where id = ? and active = ?",
        [Number(body.price), id, true],
      );
      if (result.affectedRows === 0) {
        res.status(200).json({ message: "product not found" });
        return;
      }
      res.status(200).json({ message: "price updated" });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ message: "internal server error" });
    }
  }
}