import { ErrorCodes } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { ScrewData } from "@/types";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { screws } from "../db/schema/screw";
import { j, publicProcedure } from "../jstack";

interface ExcelRow {
  id: string;
  [key: string]: any;
}

export const fileRouter = j.router({
  excel: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input;
      const { db } = ctx;

      const post = await db
        .insert(screws)
        .values({
          material: 1,
          name: name,
          price: "0",
          size: 1,
          type: 1,
          stock: "",
        })
        .execute();

      return c.superjson(createSuccessResponse(post), 200);
    }),

  importExcel: publicProcedure.mutation(async ({ ctx, c }) => {
    const { db } = ctx;
    const formData = await c.req.parseBody();
    const file = formData["file"]! as File;

    if (!file) {
      return c.superjson(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          statusCode: 400,
          message: json.error.invalidFile,
        }),
        400
      );
    }

    // Check if file is Excel
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return c.superjson(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          statusCode: 400,
          message: json.error.invalidFileExtension,
          errors: [
            {
              code: ErrorCodes.BAD_REQUEST,
              message: json.error.invalidFileExtension,
              field: "file",
            },
          ],
        }),
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();

    // Load workbook from buffer
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const rows: ScrewData[] = [];

    // Process the first worksheet
    workbook.worksheets.forEach(async (worksheet) => {
      if (!worksheet) {
        return c.superjson(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            statusCode: 400,
            message: json.error.invalidFile,
            errors: [
              {
                code: ErrorCodes.BAD_REQUEST,
                message: json.error.invalidFile,
                field: "file",
              },
            ],
          }),
          400
        );
      }



      // Process data rows
      for (let i = 8; i < 11; i++) {
        const row: ScrewData = {
          name: "",
          description: "",
          videos: [],
          type: 1,
          material: 1,
          stock: "",
          others: [],
          price: "",
          images: [],
          note: "",
          size: 1,
        };
        const excelJsRow = worksheet.getRow(i);
        row.name = excelJsRow.getCell(1).value?.toString()!;
        row.description = excelJsRow.getCell(2).value?.toString()!;
        row.material = 1;
        row.stock = excelJsRow.getCell(4).value?.toString()!;
        row.note = excelJsRow.getCell(5).value?.toString()!;
        row.price = excelJsRow.getCell(6).value?.toString()!;
        rows.push(row);
      }
    });

    const result = await db.insert(screws).values(rows).execute();

    return c.superjson(
      createSuccessResponse({
        success: true,
      }),
      200
    );
  }),
});

function createId(): string {
  return uuidv4();
}

function getUrl(cell: ExcelJS.Cell) {
  if (cell.isHyperlink) {
    return cell.hyperlink;
  }
  return cell.value?.toString()!;
}
