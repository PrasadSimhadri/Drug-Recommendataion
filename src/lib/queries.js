export const queries = {

    // LIST ALL IDs - for dropdowns
    ALL_PATIENTS: {
        cypher: `MATCH (p:Patient) RETURN p.id AS id ORDER BY p.id LIMIT 100`,
        param: null
    },

    ALL_VISITS: {
        cypher: `MATCH (e:Encounter) RETURN e.id AS id ORDER BY e.id LIMIT 10`,
        param: null
    },

    // PATIENT QUERIES
    PATIENT_DRUGS: {
        cypher: (limit) => `
        MATCH (p:Patient {id:$id})-[r:PRESCRIBED]->(d:Drug)
        WITH p, d, collect(r)[0] AS rel
        RETURN p, rel, d${limit ? ` LIMIT ${limit}` : ''}
        `,
        param: "id"
    },

    PATIENT_DIAGNOSES: {
        cypher: (limit) => `
        MATCH (p:Patient {id:$id})-[r:DIAGNOSED_AS]->(d:Diagnosis)
        WITH p, d, collect(r)[0] AS rel
        RETURN p, rel, d${limit ? ` LIMIT ${limit}` : ''}
        `,
        param: "id"
    },

    PATIENT_ADMISSIONS: {
        cypher: (limit) => `
        MATCH (p:Patient {id:$id})-[r:ADMITTED]->(e:Encounter)
        WITH p, e, collect(r)[0] AS rel
        RETURN p, rel, e${limit ? ` LIMIT ${limit}` : ''}
        `,
        param: "id"
    },

    // VISIT QUERIES
    VISIT_DIAGNOSES: {
        cypher: (limit) => `
    MATCH (e:Encounter {id:$visit})-[r:DIAGNOSED]->(d:Diagnosis)
    WITH e, d, collect(r)[0] AS rel
    RETURN e, rel, d${limit ? ` LIMIT ${limit}` : ''}
  `,
        param: "visit"
    },

    VISIT_DRUGS: {
        cypher: (limit) => `
    MATCH (e:Encounter {id:$visit})
      -[:DIAGNOSED]->(:Diagnosis)
      -[r:PRESCRIBED_FOR]->(d:Drug)
      WITH e, d, collect(r)[0] AS rel
    RETURN DISTINCT e,rel, d${limit ? ` LIMIT ${limit}` : ''}
  `,
        param: "visit"
    }

};
