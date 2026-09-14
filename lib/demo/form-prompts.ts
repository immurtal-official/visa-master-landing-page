import type { FormQuestion, FormValues } from "./official-form.ts";
import type { Locale } from "./intake.ts";

// Conversational wording uses canonical map IDs to retain each field's subject.
export function formPrompt(
  question: FormQuestion,
  locale: Locale,
  values: FormValues,
) {
  const c = (en: string, cn: string, es: string) => ({ en, cn, es })[locale];
  const passport = values["travel_document.type"] === "ordinary_passport";
  const doc = c(
    passport ? "passport" : "travel document",
    passport ? "护照" : "旅行证件",
    passport ? "pasaporte" : "documento de viaje",
  );
  const friendly: Record<string, string> = {
    "host.name": c("What is the name of your hotel or accommodation, or the person hosting you?", "你入住的酒店或其他住宿叫什么名字？如果住在他人家中，请填写接待人的姓名。", "¿Cómo se llama tu alojamiento o la persona que te hospeda?"),
    "host.address": c("What is the address of that hotel, accommodation or host?", "这家酒店、住宿或接待人的地址是什么？", "¿Cuál es la dirección de ese alojamiento o anfitrión?"),
    "host.email": c("What is the email address of that hotel, accommodation or host?", "这家酒店、住宿或接待人的电子邮箱是什么？", "¿Cuál es el correo electrónico de ese alojamiento o anfitrión?"),
    "host.phone": c("What is the phone number of that hotel, accommodation or host?", "这家酒店、住宿或接待人的联系电话是什么？", "¿Cuál es el teléfono de ese alojamiento o anfitrión?"),
    "travel_document.number": c(
      `What is your ${doc} number?`,
      `你的${doc}号码是什么？`,
      `¿Cuál es el número de tu ${doc}?`,
    ),
    "travel_document.issue_date": c(
      `When was your ${doc} issued? Use its date of issue, not your date of birth.`,
      `你的${doc}签发日期是哪一天？请填写证件上的签发日期，不是出生日期。`,
      `¿Cuándo se expidió tu ${doc}? Usa la fecha de expedición, no tu fecha de nacimiento.`,
    ),
    "travel_document.expiry_date": c(
      `When does your ${doc} expire? Use the expiry date printed on it.`,
      `你的${doc}有效期至哪一天？请填写证件上标注的到期日期。`,
      `¿Cuándo caduca tu ${doc}? Usa la fecha de caducidad impresa.`,
    ),
    "travel_document.issuing_country": c(
      `Which country issued your ${doc}?`,
      `你的${doc}是由哪个国家签发的？`,
      `¿Qué país expidió tu ${doc}?`,
    ),
    "residence.permit.valid_until": c(
      "When does your residence permit expire?",
      "你的居留许可有效期至哪一天？",
      "¿Cuándo caduca tu permiso de residencia?",
    ),
    "final_destination_permit.valid_from": c(
      "When does your entry permit for the final country outside Schengen become valid?",
      "你前往申根区外最终目的地的入境许可，从哪一天开始生效？",
      "¿Desde qué fecha es válido el permiso de entrada al destino final fuera de Schengen?",
    ),
    "final_destination_permit.valid_until": c(
      "When does that entry permit for your final destination outside Schengen expire?",
      "你前往申根区外最终目的地的入境许可，到哪一天到期？",
      "¿Cuándo caduca el permiso de entrada al destino final fuera de Schengen?",
    ),
    "final_destination_permit.issued_by": c(
      "Which authority issued your entry permit for the final destination outside Schengen?",
      "你前往申根区外最终目的地的入境许可，是由哪个机关签发的？",
      "¿Qué autoridad expidió el permiso de entrada al destino final fuera de Schengen?",
    ),
    "journey.arrival_date": c(
      "On what date do you plan to enter the Schengen area for this trip?",
      "这次行程中，你计划哪一天进入申根区？",
      "¿En qué fecha piensas entrar en el espacio Schengen para este viaje?",
    ),
    "journey.departure_date": c(
      "On what date do you plan to leave the Schengen area for this trip?",
      "这次行程中，你计划哪一天离开申根区？",
      "¿En qué fecha piensas salir del espacio Schengen?",
    ),
    "declaration.date": c(
      "What date will you put beside your signature on the application? If you sign later, update this date then.",
      "你将在申请表签名处填写哪一天的日期？如果之后才签名，请届时更新日期。",
      "¿Qué fecha pondrás junto a tu firma en la solicitud? Actualízala si firmas más adelante.",
    ),
    "declaration.place": c(
      "In which city will you sign the application form?",
      "你将在哪个城市签署这份申请表？",
      "¿En qué ciudad firmarás la solicitud?",
    ),
    "biometrics.previous.date": c(
      "When were your fingerprints previously collected for a Schengen visa, if known?",
      "如果知道，你上一次申请申根签证时采集指纹的日期是哪一天？",
      "Si lo sabes, ¿cuándo se recogieron tus huellas para un visado Schengen anterior?",
    ),
    "biometrics.previous.visa_number": c(
      "What is the visa sticker number of that previous Schengen visa, if known?",
      "如果知道，那次申根签证的签证贴纸号码是什么？",
      "Si lo sabes, ¿cuál es el número de la etiqueta de aquel visado Schengen?",
    ),
    "inviting_company.contact.address": c(
      "What is the address of the contact person at the inviting company or organisation?",
      "邀请公司或组织的联系人的地址是什么？",
      "¿Cuál es la dirección de la persona de contacto de la entidad que te invita?",
    ),
    "inviting_company.contact.email": c(
      "What is the email address of the contact person at the inviting company or organisation?",
      "邀请公司或组织的联系人的电子邮箱是什么？",
      "¿Cuál es el correo electrónico de la persona de contacto de la entidad que te invita?",
    ),
    "inviting_company.contact.name.family": c(
      "What is the surname of the contact person at the inviting company or organisation?",
      "邀请公司或组织的联系人姓什么？",
      "¿Cuál es el apellido de la persona de contacto de la entidad que te invita?",
    ),
    "inviting_company.contact.name.given": c(
      "What are the given names of the contact person at the inviting company or organisation?",
      "邀请公司或组织的联系人的名字是什么？",
      "¿Cuáles son los nombres de la persona de contacto de la entidad que te invita?",
    ),

    "applicant.name.family": c(
      "What is your surname, exactly as shown in your passport?",
      "你的护照上，姓氏的英文或拼音是什么？",
      "¿Cuál es tu apellido tal como aparece en tu pasaporte?",
    ),
    "applicant.name.family_at_birth": c(
      "What was your surname at birth? If it has not changed, use the same surname.",
      "你出生时的姓氏是什么？如果没有改过姓，填写相同姓氏即可。",
      "¿Cuál era tu apellido al nacer? Si no cambió, usa el mismo.",
    ),
    "applicant.name.given": c(
      "What are your given names, exactly as shown in your passport?",
      "你的护照上，名字的英文或拼音是什么？",
      "¿Cuáles son tus nombres tal como aparecen en tu pasaporte?",
    ),
    "journey.final_destination_permit_required": c(
      "After leaving Schengen, will you visit another country that requires an entry permit? If you are returning home to China as a Chinese citizen, choose No.",
      "离开申根区后，你是否还要前往需要签证的其他国家？如果作为中国公民直接返回中国，选“否”。",
      "Después de Schengen, ¿visitarás otro país que requiera un permiso de entrada? Si regresas a China como ciudadano chino, elige No.",
    ),
  };
  if (friendly[question.id]) return friendly[question.id];
  const label = question.label.replace(/^\d+\.\s*/, "");
  if (question.type === "boolean") return label;
  return question.choices
    ? c(
        `Please choose: ${label.toLowerCase()}.`,
        `请选择：${label}。`,
        `Selecciona: ${label}.`,
      )
    : c(
        `Please enter your ${label.toLowerCase()}.`,
        `请填写你的${label}。`,
        `Indica: ${label}.`,
      );
}
