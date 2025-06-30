const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/buscar-fatura', async (req, res) => {
  const { cpf, unidadeConsumidora } = req.body;

  if (!cpf || !unidadeConsumidora) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://servicos.neoenergia.com/fatura', {
      waitUntil: 'domcontentloaded'
    });

    // Substitua os seletores conforme o site real
    await page.type('#cpfInput', cpf);
    await page.type('#unidadeInput', unidadeConsumidora);
    await page.click('#btnBuscar');
    await page.waitForSelector('.resultado-fatura');

    const dadosFatura = await page.evaluate(() => {
      return {
        vencimento: document.querySelector('.vencimento')?.innerText || null,
        valor: document.querySelector('.valor')?.innerText || null,
        status: document.querySelector('.status')?.innerText || null
      };
    });

    await browser.close();
    return res.json(dadosFatura);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar fatura' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
