const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:4ZaBQ0k2YGOKgvqf@db.xrpkgjgesanklkhmkstr.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();

    // Drop and recreate the unique index explicitly  
    await client.query(`
      DROP INDEX IF EXISTS presupuestos_solicitud_id_key;
      CREATE UNIQUE INDEX presupuestos_solicitud_id_key ON public.presupuestos(solicitud_id);
    `);
    console.log('✅ Unique index recreated on solicitud_id');

    // Refresh schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ Schema cache refreshed');

    // Verify
    const idx = await client.query(`
      SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'presupuestos';
    `);
    console.log('\nIndexes:', idx.rows);

  } catch (e) { console.error('Error:', e); }
  finally { await client.end(); }
}
run();
