import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepagePath = path.join(root, 'index.html');

test('homepage contains the applicant profile and ordered sections', () => {
  const html = fs.readFileSync(homepagePath, 'utf8');
  assert.match(html, /<h1>CHEN Hongyu/);
  assert.match(html, /final-year undergraduate/i);
  assert.match(html, /dual (?:BSc )?degree in Mathematics and Computer Science/i);
  assert.match(html, /GPA 3\.95\/4\.3/);
  assert.match(html, /PhD opportunities starting Fall 2027/i);
  assert.match(html, /multimodal representation learning/i);
  assert.match(html, /world models/i);
  assert.match(html, /post-training/i);
  assert.match(html, /training data distributions.*learning objectives.*performance and generalization/is);
  assert.match(html, /targeted data construction.*reinforcement learning.*distillation/is);
  assert.doesNotMatch(html, /autonomous agents/i);

  for (const id of ['about', 'interests', 'research', 'manuscript', 'education', 'projects']) {
    assert.match(html, new RegExp(`<section[^>]+id=["']${id}["']`, 'i'));
  }
  assert.ok(html.indexOf('id="about"') < html.indexOf('id="research"'));
  assert.ok(html.indexOf('id="about"') < html.indexOf('id="interests"'));
  assert.ok(html.indexOf('id="interests"') < html.indexOf('id="research"'));
  assert.ok(html.indexOf('id="research"') < html.indexOf('id="manuscript"'));
  assert.ok(html.indexOf('id="manuscript"') < html.indexOf('id="education"'));
  assert.ok(html.indexOf('id="education"') < html.indexOf('id="projects"'));
  assert.doesNotMatch(html, /id=["'](?:news|publications|writing)["']/i);
});

test('research and manuscript descriptions remain scoped to supported claims', () => {
  const html = fs.readFileSync(homepagePath, 'utf8');
  const research = html.match(/<section id="research">([\s\S]*?)<\/section>/i)?.[1];
  assert.ok(research, 'research section should exist');
  const navigationStart = research.indexOf('Navigation World Models');
  const vlmStart = research.indexOf('VLM Post-Training');
  assert.ok(navigationStart >= 0 && vlmStart > navigationStart);
  const navigation = research.slice(navigationStart, vlmStart);
  const vlm = research.slice(vlmStart);
  assert.match(navigation, /Ongoing Research/);
  assert.match(navigation, /Isaac Sim.*NavDP.*A\*.*perturbation-based trajectory collection/is);
  assert.match(navigation, /trajectory coverage.*training distributions.*action-conditioned simulation fidelity/is);
  assert.match(vlm, /Ongoing Research/);
  assert.match(vlm, /reinforcement learning.*on-policy self-distillation/is);
  assert.match(html, /ScaleGen: Scaling Up Perceptual Super-Resolution with Million-Scale Diffusion-Generated Images/);
  assert.match(html, /Under review at IEEE Transactions on Multimedia/);
  assert.match(html, /Third author/);
  assert.doesNotMatch(html, /SOTA|state-of-the-art|accepted|published|arXiv|preprint|\[Paper\]|\bscholar\b/i);
  assert.doesNotMatch(html, /fine-tuning improves|improves results|specific model version/i);
});

test('contact links and local assets are present and old blog is unpublished', () => {
  const html = fs.readFileSync(homepagePath, 'utf8');
  assert.match(html, /href=["']mailto:hongyuc219@gmail\.com["']/);
  assert.match(html, /href=["']https:\/\/github\.com\/Leochen219["']/);
  assert.match(html, /href=["']files\/CHEN_Hongyu_CV\.pdf["']/);
  assert.ok(fs.existsSync(path.join(root, 'images', 'chen-hongyu.jpg')));
  assert.ok(fs.existsSync(path.join(root, 'files', 'CHEN_Hongyu_CV.pdf')));
  assert.equal(fs.existsSync(path.join(root, 'blog')), false);
  assert.equal(fs.existsSync(path.join(root, 'images', 'blog', 'world-model-stacks')), false);
  assert.equal(fs.existsSync(path.join(root, 'css', 'blog.css')), false);
  for (const href of [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1])) {
    if (/^(?:https?:|mailto:|#|data:)/i.test(href)) continue;
    assert.ok(fs.existsSync(path.join(root, href.split('#')[0])), `missing local target: ${href}`);
  }
});
