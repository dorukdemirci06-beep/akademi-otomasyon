import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """@app.get("/siniflar/", response_model=List[schemas.SinifResponse])
def get_siniflar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Sinif)
    if current_user.akademi_adi:
        query = query.filter(models.Sinif.akademi_adi == current_user.akademi_adi)
    siniflar = query.all()
    res = []"""

replacement = """@app.get("/siniflar/", response_model=List[schemas.SinifResponse])
def get_siniflar(
    basic: bool = False,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Sinif)
    if current_user.akademi_adi:
        query = query.filter(models.Sinif.akademi_adi == current_user.akademi_adi)
    siniflar = query.all()
    
    if basic:
        return siniflar
        
    res = []"""

if target in content:
    content = content.replace(target, replacement)
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Patched main.py successfully')
else:
    print('Target not found')
