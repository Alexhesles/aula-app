-- ============================================================
-- AULA · 0007b — Set inicial de MUESTRA de contenidos 5° y 6°
-- Representativo y EDITABLE. Reemplázalo / complétalo con tus
-- contenidos oficiales desde la app (pantalla "Pegar contenidos").
-- Idempotente: no duplica si ya existe el mismo contenido.
-- ============================================================

insert into public.curriculum_contents (grade, subject, block, content, position)
select v.grade, v.subject, v.block, v.content, v.position
from (values
  -- ===================== 5° =====================
  ('5','Español',1,'Identificar la estructura de textos expositivos y sus elementos',1),
  ('5','Español',1,'Elaborar resúmenes a partir de ideas principales y secundarias',2),
  ('5','Español',2,'Escribir textos argumentativos con introducción, desarrollo y conclusión',3),
  ('5','Español',2,'Usar nexos y conectores para dar cohesión a un texto',4),
  ('5','Español',3,'Analizar y comparar versiones de un mismo relato',5),

  ('5','Matemáticas',1,'Leer, escribir y comparar números naturales y decimales',1),
  ('5','Matemáticas',1,'Resolver problemas de suma y resta de fracciones con distinto denominador',2),
  ('5','Matemáticas',2,'Multiplicar y dividir números decimales en situaciones cotidianas',3),
  ('5','Matemáticas',2,'Calcular perímetro y área de figuras compuestas',4),
  ('5','Matemáticas',3,'Interpretar información en tablas y gráficas de barras',5),

  ('5','Ciencias Naturales',1,'Describir el funcionamiento de los aparatos del cuerpo humano',1),
  ('5','Ciencias Naturales',1,'Reconocer hábitos para una alimentación equilibrada',2),
  ('5','Ciencias Naturales',2,'Explicar los estados de la materia y sus cambios',3),
  ('5','Ciencias Naturales',3,'Identificar fuentes y transformaciones de la energía',4),

  ('5','Geografía',1,'Localizar continentes, océanos y líneas imaginarias en mapas',1),
  ('5','Geografía',2,'Relacionar relieve, clima y vegetación de las regiones del mundo',2),
  ('5','Geografía',3,'Analizar la distribución de la población mundial',3),

  ('5','Historia',1,'Ubicar en una línea del tiempo los grandes periodos históricos',1),
  ('5','Historia',2,'Explicar causas y consecuencias de la Independencia de México',2),
  ('5','Historia',3,'Describir transformaciones sociales del México del siglo XIX',3),

  ('5','Formación Cívica y Ética',1,'Reconocer derechos y responsabilidades de la niñez',1),
  ('5','Formación Cívica y Ética',2,'Practicar el diálogo para resolver conflictos',2),
  ('5','Formación Cívica y Ética',3,'Valorar la diversidad cultural de México',3),

  -- ===================== 6° =====================
  ('6','Español',1,'Elaborar reportes de investigación a partir de varias fuentes',1),
  ('6','Español',1,'Distinguir hechos de opiniones en textos periodísticos',2),
  ('6','Español',2,'Escribir cartas formales para distintos propósitos',3),
  ('6','Español',2,'Emplear correctamente la puntuación en textos extensos',4),
  ('6','Español',3,'Analizar recursos literarios en poemas y cuentos',5),

  ('6','Matemáticas',1,'Resolver problemas con números enteros positivos y negativos',1),
  ('6','Matemáticas',1,'Calcular porcentajes en contextos de la vida diaria',2),
  ('6','Matemáticas',2,'Aplicar proporcionalidad directa para resolver problemas',3),
  ('6','Matemáticas',2,'Calcular volumen de prismas y cuerpos geométricos',4),
  ('6','Matemáticas',3,'Calcular media y mediana de un conjunto de datos',5),

  ('6','Ciencias Naturales',1,'Explicar el proceso de reproducción humana y los cambios en la pubertad',1),
  ('6','Ciencias Naturales',2,'Analizar cadenas y redes alimentarias en un ecosistema',2),
  ('6','Ciencias Naturales',2,'Describir la importancia del cuidado del medio ambiente',3),
  ('6','Ciencias Naturales',3,'Identificar fuerzas, movimiento y máquinas simples',4),

  ('6','Geografía',1,'Comparar indicadores sociales y económicos entre países',1),
  ('6','Geografía',2,'Analizar redes de transporte y comercio mundial',2),
  ('6','Geografía',3,'Reflexionar sobre el cuidado del ambiente a escala global',3),

  ('6','Historia',1,'Explicar la Revolución Mexicana y sus principales actores',1),
  ('6','Historia',2,'Describir los cambios de México en el siglo XX',2),
  ('6','Historia',3,'Analizar acontecimientos relevantes del mundo contemporáneo',3),

  ('6','Formación Cívica y Ética',1,'Tomar decisiones informadas para el cuidado de la salud',1),
  ('6','Formación Cívica y Ética',2,'Reconocer los principios de la democracia y la justicia',2),
  ('6','Formación Cívica y Ética',3,'Participar en acciones a favor del bien común',3)
) as v(grade, subject, block, content, position)
where not exists (
  select 1 from public.curriculum_contents c
  where c.grade = v.grade and c.subject = v.subject and c.content = v.content
);
