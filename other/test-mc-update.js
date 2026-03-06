// fetch-minecraft-updates.js
import fetch from 'node-fetch';

// Base URL API
const BASE_URL = 'https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json';

// Kata kunci untuk identifikasi
const KEYWORDS = {
  BEDROCK: ['bedrock', 'preview', 'beta', 'android', 'ios', 'windows', 'xbox', 'playstation'],
  JAVA: ['java', 'snapshot', 'pre-release']
};

/**
 * Fungsi untuk mengambil semua artikel dengan pagination
 */
async function fetchAllArticles() {
  let allArticles = [];
  let nextPage = BASE_URL;
  let pageCount = 0;

  console.log('📥 Mulai mengambil data dari API...');
  
  while (nextPage) {
    try {
      const response = await fetch(nextPage);
      const data = await response.json();
      
      allArticles = [...allArticles, ...data.articles];
      nextPage = data.next_page;
      pageCount++;
      
      console.log(`   Halaman ${pageCount}/${data.page_count || '?'} - ${data.articles.length} artikel (Total: ${allArticles.length})`);
      
      // Delay kecil untuk menghormati rate limit
      if (nextPage) await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('❌ Gagal mengambil data:', error.message);
      break;
    }
  }
  
  console.log(`✅ Selesai! Total ${allArticles.length} artikel dari ${pageCount} halaman\n`);
  return allArticles;
}

/**
 * Kategorikan artikel berdasarkan edisi dan jenis rilis
 */
function categorizeArticles(articles) {
  const result = {
    bedrock: {
      stable: [],
      preview_beta: [],
      other: []
    },
    java: {
      stable: [],
      snapshot_pre_release: [],
      other: []
    },
    uncategorized: []
  };

  articles.forEach(article => {
    const title = article.title?.toLowerCase() || '';
    const body = article.body?.toLowerCase() || '';
    const text = `${title} ${body}`;
    
    // Deteksi edisi
    const isBedrock = KEYWORDS.BEDROCK.some(keyword => text.includes(keyword));
    const isJava = KEYWORDS.JAVA.some(keyword => text.includes(keyword));
    
    // Jika keduanya terdeteksi, prioritas berdasarkan konteks
    let category = null;
    
    if (isBedrock && !isJava) {
      category = 'bedrock';
    } else if (isJava && !isBedrock) {
      category = 'java';
    } else if (isBedrock && isJava) {
      // Cek judul untuk menentukan prioritas
      if (title.includes('bedrock') || title.includes('preview') || title.includes('beta')) {
        category = 'bedrock';
      } else if (title.includes('java')) {
        category = 'java';
      } else {
        category = 'uncategorized'; // Perlu pengecekan manual
      }
    }
    
    if (!category) {
      result.uncategorized.push(article);
      return;
    }
    
    // Deteksi jenis rilis untuk Bedrock
    if (category === 'bedrock') {
      if (text.includes('preview') || text.includes('beta')) {
        result.bedrock.preview_beta.push(article);
      } else if (text.includes('stable') || 
                (article.section_id === 360001185332 && !text.includes('beta') && !text.includes('preview'))) {
        // Section 360001185332 adalah "Release Changelog" (asumsi untuk stable)
        result.bedrock.stable.push(article);
      } else {
        result.bedrock.other.push(article);
      }
    }
    
    // Deteksi jenis rilis untuk Java
    if (category === 'java') {
      if (text.includes('snapshot') || text.includes('pre-release') || text.includes('pre release')) {
        result.java.snapshot_pre_release.push(article);
      } else if (text.includes('stable') || 
                (article.section_id === 360001186011 && !text.includes('snapshot') && !text.includes('pre-release'))) {
        // Section 360001186011 adalah "Java Release Changelog" (asumsi untuk stable)
        result.java.stable.push(article);
      } else {
        result.java.other.push(article);
      }
    }
  });
  
  return result;
}

/**
 * Format output yang rapi
 */
function formatOutput(categorized) {
  console.log('='.repeat(80));
  console.log('📊 LAPORAN UPDATE MINECRAFT');
  console.log('='.repeat(80));
  console.log(`\n📦 BEDROCK EDITION (Total: ${categorized.bedrock.stable.length + categorized.bedrock.preview_beta.length + categorized.bedrock.other.length})`);
  console.log(`   ✅ Stable: ${categorized.bedrock.stable.length} artikel`);
  console.log(`   🧪 Preview/Beta: ${categorized.bedrock.preview_beta.length} artikel`);
  console.log(`   📌 Lainnya: ${categorized.bedrock.other.length} artikel`);
  
  if (categorized.bedrock.stable.length > 0) {
    console.log('\n   ✅ Stable Release:');
    categorized.bedrock.stable.slice(0, 5).forEach((a, i) => {
      console.log(`     ${i+1}. ${a.title} (${new Date(a.updated_at).toLocaleDateString('id-ID')})`);
    });
    if (categorized.bedrock.stable.length > 5) console.log(`     ... dan ${categorized.bedrock.stable.length - 5} lainnya`);
  }
  
  if (categorized.bedrock.preview_beta.length > 0) {
    console.log('\n   🧪 Preview/Beta Terbaru:');
    categorized.bedrock.preview_beta.slice(0, 3).forEach((a, i) => {
      console.log(`     ${i+1}. ${a.title} (${new Date(a.updated_at).toLocaleDateString('id-ID')})`);
    });
  }
  
  console.log(`\n☕ JAVA EDITION (Total: ${categorized.java.stable.length + categorized.java.snapshot_pre_release.length + categorized.java.other.length})`);
  console.log(`   ✅ Stable: ${categorized.java.stable.length} artikel`);
  console.log(`   🧪 Snapshot/Pre-release: ${categorized.java.snapshot_pre_release.length} artikel`);
  console.log(`   📌 Lainnya: ${categorized.java.other.length} artikel`);
  
  if (categorized.java.snapshot_pre_release.length > 0) {
    console.log('\n   🧪 Snapshot/Pre-release Terbaru:');
    categorized.java.snapshot_pre_release.slice(0, 3).forEach((a, i) => {
      console.log(`     ${i+1}. ${a.title} (${new Date(a.updated_at).toLocaleDateString('id-ID')})`);
    });
  }
  
  console.log(`\n❓ UNCATEGORIZED: ${categorized.uncategorized.length} artikel (perlu pengecekan manual)`);
  if (categorized.uncategorized.length > 0) {
    console.log('   Contoh:');
    categorized.uncategorized.slice(0, 3).forEach((a, i) => {
      console.log(`     ${i+1}. ${a.title}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🕐 Update terakhir: ${new Date().toLocaleString('id-ID')}`);
  console.log('='.repeat(80));
  
  return categorized;
}

/**
 * Fungsi utama
 */
async function main() {
  try {
    // 1. Ambil semua data
    const articles = await fetchAllArticles();
    
    // 2. Kategorikan
    console.log('🏷️  Mengkategorikan artikel...');
    const categorized = categorizeArticles(articles);
    
    // 3. Tampilkan hasil
    formatOutput(categorized);
    
    // 4. Simpan ke file (opsional)
    const fs = await import('fs/promises');
    await fs.writeFile(
      'minecraft-updates.json', 
      JSON.stringify({
        metadata: {
          total_articles: articles.length,
          fetched_at: new Date().toISOString()
        },
        categorized
      }, null, 2)
    );
    console.log('\n💾 Data lengkap disimpan ke minecraft-updates.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jalankan script
main();