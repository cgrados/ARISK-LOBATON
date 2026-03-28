-- Update scoring rules to include more synonyms and fix Profession
DO $$
DECLARE
    scoring_rules JSONB;
BEGIN
    SELECT data INTO scoring_rules FROM sys_settings WHERE id = 'scoring_rules';
    
    -- UpdateProfession (v8) rules to include generic terms
    -- (You can add more specific PROFESSIONS here if needed)
    
    -- Update Actividad (v13)
    -- Ensure all 13 variables are present
    
    -- We'll just overwrite with a more robust version of the rules
    UPDATE sys_settings 
    SET data = '{
        "variables": [
          {"id": "v1", "name": "Edad", "type": "range", "rules": [{"min": 18, "max": 25, "score": 10}, {"min": 26, "max": 45, "score": 20}, {"min": 46, "max": 65, "score": 30}]},
          {"id": "v2", "name": "Estado Civil", "type": "exact", "rules": [{"value": "Casado (a)", "score": 15}, {"value": "Soltero (a)", "score": 10}, {"value": "Conviviente", "score": 10}, {"value": "Soltero", "score": 10}, {"value": "Casado", "score": 15}]},
          {"id": "v3", "name": "Nro de dependientes", "type": "range", "rules": [{"min": 0, "max": 0, "score": 30}, {"min": 1, "max": 2, "score": 20}, {"min": 3, "max": 30, "score": 10}]},
          {"id": "v4", "name": "Sexo", "type": "exact", "rules": [{"value": "Femenino", "score": 25}, {"value": "Masculino", "score": 15}, {"value": "M", "score": 15}, {"value": "F", "score": 25}]},
          {"id": "v5", "name": "Antigüedad Laboral", "type": "range", "rules": [{"min": 0, "max": 1, "score": 10}, {"min": 2, "max": 3, "score": 20}, {"min": 4, "max": 50, "score": 30}]},
          {"id": "v6", "name": "Condición vivienda", "type": "exact", "rules": [{"value": "Propia", "score": 30}, {"value": "Familiar", "score": 20}, {"value": "Alquilada", "score": 10}]},
          {"id": "v7", "name": "Instrucción", "type": "exact", "rules": [{"value": "Secundaria", "score": 10}, {"value": "Técnico", "score": 20}, {"value": "Universitaria", "score": 30}, {"value": "Superior", "score": 30}, {"value": "SUPERIOR", "score": 30}]},
          {"id": "v8", "name": "Profesión", "type": "exact", "rules": [{"value": "Comerciante", "score": 15}, {"value": "Abogado", "score": 25}, {"value": "Ingeniero", "score": 25}, {"value": "Independiente", "score": 15}, {"value": "Dependiente", "score": 25}]},
          {"id": "v9", "name": "Ubicación vivienda", "type": "exact", "rules": [{"value": "Lima", "score": 20}, {"value": "Provincia", "score": 15}]},
          {"id": "v10", "name": "Tamaño empresa", "type": "exact", "rules": [{"value": "Microempresa", "score": 10}, {"value": "Pequeña empresa", "score": 15}, {"value": "Mediana empresa", "score": 25}]},
          {"id": "v11", "name": "Clasificación interna", "type": "exact", "rules": [{"value": "Normal", "score": 30}, {"value": "CPP", "score": 15}, {"value": "Deficiente", "score": 0}]},
          {"id": "v12", "name": "Clasificación Central", "type": "exact", "rules": [{"value": "100% Normal", "score": 40}, {"value": "Normal", "score": 40}, {"value": "CPP", "score": 10}, {"value": "Deficiente", "score": -50}]},
          {"id": "v13", "name": "Actividad Económica", "type": "exact", "rules": [{"value": "Comercio", "score": 20}, {"value": "Producción", "score": 25}, {"value": "Servicios", "score": 15}]}
        ],
        "cutoffs": [
          {"action": "DENEGAR", "color": "rgb(239, 68, 68)", "min": 0, "max": 150},
          {"action": "REVISAR", "color": "rgb(234, 179, 8)", "min": 151, "max": 180},
          {"action": "APROBAR", "color": "rgb(34, 197, 94)", "min": 181, "max": 9999}
        ]
    }'::jsonb
    WHERE id = 'scoring_rules';
END $$;
