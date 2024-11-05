// server action modules contain server-side logic in RPC functions
"use server";

import { db } from "@/lib/db";
import {
  CaseColor,
  CaseFinish,
  CaseMaterial,
  PhoneModel,
} from "@prisma/client";

// predefine type for given object
export type SaveConfigArgs = {
  configId: string;
  // only the values from the enum types are allowed in these props
  color: CaseColor;
  finish: CaseFinish;
  material: CaseMaterial;
  model: PhoneModel;
};

// function responsible for saving configurations by the user (phone case color, material, finish and model)
export const saveConfig = async ({
  configId,
  color,
  finish,
  material,
  model,
}: SaveConfigArgs) => {
  // update phone case config whose "id" matches the given "configId"
  await db.configuration.update({
    where: { id: configId },
    // update fields 'model', 'material', 'finish' & 'color'
    data: { model, material, finish, color },
  });
};
