// AppRec.js
/**
 * AppRec is a utility class for interacting with Zoho Creator forms and reports.
 * It provides CRUD operations (Create, Read, Update, Delete), record counting, and local record filtering.
 *
 * @class
 * @example
 * const appRec = new AppRec({ form: "MyForm", report: "MyReport" });
 *
 * @param {Object} options
 * @param {string} [options.form] - The Zoho Creator form name (required for create, update, delete).
 * @param {string} [options.report] - The Zoho Creator report name (required for read, count).
 */

// Export AppRec as default and formatPhone as named export

export default class AppRec {
  /**
   * Creates an instance of AppRec for Zoho Creator form/report operations.
   * @constructor
   * @param {Object} options - Options for the record handler.
   * @param {string} [options.form] - The Zoho Creator form name (required for create, update, delete).
   * @param {string} [options.report] - The Zoho Creator report name (required for read, count).
   * @param {string} [options.criteria] - Optional criteria for filtering records.
   */
  constructor({ form, report, criteria = "" } = {}) {
    if (!form && !report) {
      throw new Error("Either form or report must be provided");
    }
    this.form = form;
    this.report = report;
    this.records = [];
    this.count = "";
    this.criteria = criteria;
  }

  /* --------------------------------------------------
   * Internal Helpers
   * -------------------------------------------------- */

  /**
   * Checks if the Zoho Creator SDK is initialized.
   * @private
   * @throws {Error} If the SDK is not initialized.
   */
  _checkSDK() {
    if (!window.ZOHO?.CREATOR?.UTIL) {
      throw new Error("Zoho Creator SDK not initialized");
    }
  }

  /**
   * Validates the response from Zoho Creator API calls.
   * @private
   * @param {Object} response - The response object from the API.
   * @param {string} [action="Zoho API call"] - The action being performed.
   * @returns {Array|Object|string} The validated data or count.
   * @throws {Error} If the response is invalid or indicates an error.
   */
  _validateResponse(response, action = "Zoho API call") {
    if (!response || typeof response !== "object") {
      throw new Error(`${action} returned an invalid response`);
    }

    if (response.code && response.code !== 3000) {
      console.error("Having a problem?" + JSON.stringify(response));
      return [];
    }

    if (response.code && response.code !== 3000) {
      throw new Error(
        `${action} failed (${response.code}): ${
          response.message || "Unknown error"
        }`
      );
    }

    if (action === "Count") {
      return response.result || "";
    }

    return response.data || [];
  }

  /**
   * Returns the base configuration for API calls.
   * @private
   * @returns {Object} The base config object.
   */
  _baseConfig() {
    return {
      //   appName: this.appName,
    };
  }

  /**
   * Normalizes a record object to ensure it has a consistent id property.
   * @private
   * @param {Object} record - The record to normalize.
   * @returns {Object} The normalized record.
   */
  _normalize(record) {
    if (!record || typeof record !== "object") return record;
    return {
      id: record.ID || record.id,
      ...record,
    };
  }

  /**
   * Clears the local records array.
   */
  clear() {
    this.records = [];
  }

  /* --------------------------------------------------
   * CREATE
   * -------------------------------------------------- */

  /**
   * Creates a new record in the Zoho Creator form.
   * @async
   * @param {Object} data - The data for the new record.
   * @returns {Promise<Object>} The newly created record.
   * @throws {Error} If the form name is missing or the API call fails.
   */
  async create(data = {}) {
    this._checkSDK();

    if (!this.form) throw new Error("Form name required for create");

    var config = {
      //  ...this._baseConfig(),
      form_name: this.form,
      payload: {
        data: data,
      },
    };

    try {
      const response = await ZOHO.CREATOR.DATA.addRecords(config);
      const records = this._validateResponse(response, "Create");

      const newRecord = data;
      newRecord.id = records;

      this.records.push(this._normalize(newRecord));

      return newRecord;
    } catch (error) {
      alert(`Error create ${this.form}:` + JSON.stringify(error.responseText));
      throw error;
    }
  }

  /* --------------------------------------------------
   * READ
   *
   * criteria - array of arrays
   * [ "Field_Name" , "Operator" , "Value" ], []
   * field_config - all / minimal / custom
   * fields - array of field names if field_config is custom
   * -------------------------------------------------- */

  /**
   * Reads records from the Zoho Creator report with optional criteria and fields.
   * @async
   * @param {string|Array} [criteria=""] - The filter criteria for records.
   * @param {string} [field_config="all"] - Field config: "all", "minimal", or "custom".
   * @param {Array<string>} [fields=[]] - Array of field names if field_config is "custom".
   * @returns {Promise<Array<Object>>} The array of records.
   * @throws {Error} If the API call fails.
   */
  async read(field_config = "all", fields = []) {
    //  this._checkSDK();

    this.clear();

    const config = {
      //   ...this._baseConfig(),
      report_name: this.report,
      criteria: this.criteria || "",
      field_config: field_config,
      max_records: 1000
    };

    if (fields.length > 0 && field_config === "custom") {
      config.fields = fields;
    }

    let hasMore = true;
    let cursor = null;

    while (hasMore) {
      if (cursor) {
        config.record_cursor = cursor;
      } else {
        delete config.record_cursor;
      }

      try {
        const response = await ZOHO.CREATOR.DATA.getRecords(config);

        if (response.code != 3000) {
          throw new Error(`Read failed (${response.code}): ${response.message || "Unknown error"}`);
          return [];
        }
        const records = this._validateResponse(response, "Read");
        this.records.push(...records.map((r) => this._normalize(r)));

        cursor = response.record_cursor;
        hasMore = !!cursor;
      } catch (error) {
        console.error("Error in read:", error);
        return [];
      }
    }

    return this.records;
  }

  /**
   * Reads a record by its ID from the Zoho Creator report with optional fields.
   * @async
   * @param {string} recID - The ID of the record to read.
   * @param {string} [field_config="all"] - Field config: "all", "minimal", or "custom".
   * @param {Array<string>} [fields=[]] - Array of field names if field_config is "custom".
   * @returns {Promise<Object>} The record object.
   * @throws {Error} If the API call fails.
   */
  async readByID(recID, field_config = "all", fields = []) {
    //  this._checkSDK();

    this.clear();

    const config = {
      //   ...this._baseConfig(),
      id: recID,
      report_name: this.report,
      field_config: field_config,
    };

    if (fields.length > 0 && field_config === "custom") {
      config.fields = fields;
    }

    let hasMore = true;
    let cursor = null;

    while (hasMore) {
      if (cursor) {
        config.record_cursor = cursor;
      } else {
        delete config.record_cursor;
      }

      try {
        const response = await ZOHO.CREATOR.DATA.getRecordById(config);
        const records = this._validateResponse(response, "ReadByID");
    //    this.records.push(...records.map((r) => this._normalize(r)));
     this.records.push(records);

        cursor = response.record_cursor;
        hasMore = !!cursor;
      } catch (error) {
        console.error("Error in readByID:", error);
        return [];
      }
    }

    return this.records;
  }
  

  /* --------------------------------------------------
   * UPDATE
   * -------------------------------------------------- */

  /**
   * Updates a record by its ID in the Zoho Creator report.
   * @async
   * @param {string} recordId - The ID of the record to update.
   * @param {Object} data - The data to update in the record.
   * @returns {Promise<Array<Object>>} The updated records.
   * @throws {Error} If the form name or recordId is missing, or the API call fails.
   */
  async updateById(recordId, data = {}) {
    this._checkSDK();

    if (!this.form) throw new Error("Form name required for update");
    if (!recordId) throw new Error("recordId is required");

    const config = {
      // ...this._baseConfig(),
      report_name: this.report,
      id: recordId,
      payload: {
        data: data,
      },
    };

    const response = await ZOHO.CREATOR.DATA.updateRecordById(config);

    const records = this._validateResponse(response, "Update");

    this.records = records.map((r) => this._normalize(r));
    return this.records;
  }

  /* --------------------------------------------------
   * DELETE
   * -------------------------------------------------- */

  /**
   * Deletes a record by its ID from the Zoho Creator report.
   * @async
   * @param {string} recordId - The ID of the record to delete.
   * @returns {Promise<boolean>} True if deletion was successful.
   * @throws {Error} If the form name or recordId is missing, or the API call fails.
   */
  async deleteById(recordId) {
    this._checkSDK();

    if (!this.form) throw new Error("Form name required for delete");
    if (!recordId) throw new Error("recordId is required");

    var config = {
      //  ...this._baseConfig(),
      report_name: this.report,
      id: recordId,
      //   payload : {
      //     skip_workflow: ["form_workflow"],
      //   }
    };

    try {
      const response = await ZOHO.CREATOR.DATA.deleteRecordById(config);
      const record = this._validateResponse(response, "Delete");
    } catch (error) {
      console.error("Error in deleteById:", error);
      throw error;
    }

    return true;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // count
  // ---------------------------------------------------------------------------------------------------------------
  /**
   * Counts the number of records in the Zoho Creator report matching the criteria.
   * @async
   * @param {string} [criteria=""] - The filter criteria for counting records.
   * @returns {Promise<number>} The count of records.
   * @throws {Error} If the API call fails.
   */
  async countRecords(criteria = "") {
    //  this._checkSDK();

    const config = {
      //   ...this._baseConfig(),
      report_name: this.report,
    };

    if (criteria) {
      config.criteria = criteria;
    }

    try {
      const response = await ZOHO.CREATOR.DATA.getRecordCount(config);
      const record = this._validateResponse(response, "Count");
      this.count = record.records_count;
    } catch (error) {
      console.error("Error in read:", error);
      throw error;
    }

    return this.count;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // viewById
  // ---------------------------------------------------------------------------------------------------------------
  /**
   * Finds a record by its ID in the local records array.
   * @param {string} id - The ID of the record to find.
   * @returns {Object|undefined} The found record or undefined if not found.
   */
  viewById(id) {
    return this.records.find((rec) => rec.id === id);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // viewByField
  // ---------------------------------------------------------------------------------------------------------------
  /**
   * Finds all records in the local records array where the field matches the value.
   * @param {string} fieldName - The field name to search by.
   * @param {*} value - The value to match.
   * @returns {Array<Object>} Array of matching records.
   */
  viewByField(fieldName, value) {
    return this.records.filter((rec) => rec[fieldName] === value);
  }




  sortBySubField(fieldName, subFieldName, ascending = true) {
    this.records.sort((a, b) => {
      const fieldA = a[fieldName] && a[fieldName][subFieldName] ? a[fieldName][subFieldName].toUpperCase() : "";
      const fieldB = b[fieldName] && b[fieldName][subFieldName] ? b[fieldName][subFieldName].toUpperCase() : "";

      if (fieldA < fieldB) {
        return ascending ? -1 : 1;
      }
      if (fieldA > fieldB) {
        return ascending ? 1 : -1;
      }
      return 0;
    });
  }
}

/**
 * Initializes Zoho Creator integration by fetching initialization and query parameters,
 * parsing user settings for a specific widget key, and extracting the parent domain from the referrer or parent window.
 *
 * @async
 * @param {string} widgetkey - The key in query params to extract user settings (e.g., 'appointments').
 * @returns {Promise<Object>} An object containing merged initialization parameters and user settings,
 *                            including the parent domain if available.
 * @example
 * const params = await initZoho('appointments');
 * // params will include Zoho init params, user settings from query, and parentDomain if available
 */
export async function initZoho(widgetkey) {
  const rep = await ZOHO.CREATOR.UTIL.getInitParams();
  const rep2 = await ZOHO.CREATOR.UTIL.getQueryParams();

  const userSettings = rep2[widgetkey] ? JSON.parse(rep2[widgetkey]) : "";

  const parentUrl = document.referrer || window.parent?.location?.href || "";

  try {
    if (parentUrl) {
      const urlObj = new URL(parentUrl);
      rep.parentDomain = urlObj.hostname;
    }
  } catch (e) {
    rep.parentDomain = "";
  }

  return { ...rep, ...userSettings };
}

/**
 * Redirects the parent window to a specified URL using Zoho Creator's UTIL API.
 *
 * @async
 * @param {string} action - The navigation action (e.g., "reload", "redirect").
 * @param {string} url - The URL to navigate to.
 * @param {string} window - The window context ("same", "new").
 * @returns {Promise<void>}
 */
export async function redirect(action, url, window) {
  const config = {
    action: action,
    url: url,
    window: window,
  };
  await ZOHO.CREATOR.UTIL.navigateParentURL(config);
}

/**
 * Formats a phone number to (XXX) XXX-XXXX, optionally handling +1, dashes, spaces, and parentheses.
 * @param {string} phone - The input phone number.
 * @returns {string} The formatted phone number or the original input if not valid.
 */
export function formatPhone(phone) {
  if (typeof phone !== "string") return phone;
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");
  // Remove leading country code if present
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  // Format if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
