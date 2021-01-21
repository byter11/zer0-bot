from translate import Translator
# import cutlet
# katsu = cutlet.Cutlet()

utranslator = Translator(to_lang="ur")
# jtranslator = Translator(to_lang="ja")
def get_urdu(s):
    return utranslator.translate(s)

# def get_jp(s):
#     t = jtranslator.translate(s)
#     return katsu.romaji(t)
