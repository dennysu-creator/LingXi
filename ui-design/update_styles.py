"""Update pet.tsx styles for commercial quality"""
import re

path = 'C:/Dev/LingXi/app/(tabs)/pet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_start = content.index('const styles = StyleSheet.create({')
# Find the matching closing
old_end = content.rindex('});') + 3

new_styles = """const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  petFullscreen: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  settingsBtn: {
    position: 'absolute', top: 54, right: 14, zIndex: 30,
    width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.20)',
    backgroundColor: 'rgba(8,8,15,0.5)',
  },
  settingsBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 17 },
  settingsIconImg: { width: 24, height: 24, opacity: 0.8 },

  floatingText: {
    position: 'absolute', bottom: 140, left: 16, right: 16, zIndex: 8,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.12)',
    backgroundColor: 'rgba(8,8,15,0.75)',
  },
  floatingBlur: { paddingHorizontal: 20, paddingVertical: 16, paddingTop: 36 },
  floatingClose: {
    position: 'absolute', top: 8, right: 10, zIndex: 5,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCloseText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  floatingContent: {
    fontSize: 15, color: '#EDE4D0', fontFamily: Fonts.serif,
    lineHeight: 26, letterSpacing: 0.3,
  },

  cameraOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 40, backgroundColor: '#000' },
  cameraView: { flex: 1 },
  cameraUI: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraHint: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.serif, marginBottom: 20, letterSpacing: 3 },
  cameraBtnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', paddingHorizontal: 40 },
  cameraCancelBtn: { width: 60, alignItems: 'center' },
  cameraCancelText: { fontSize: 16, color: '#fff', fontFamily: Fonts.serif },
  cameraShutterBtn: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#E8C547',
    alignItems: 'center', justifyContent: 'center',
    ...GlowShadow.goldStrong,
  },
  cameraShutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(232,197,71,0.25)' },

  nameplate: { position: 'absolute', bottom: 128, left: 20, zIndex: 5 },
  petName: {
    fontSize: 30, color: '#fff', fontFamily: Fonts.brush, letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12,
  },
  nameBadges: { flexDirection: 'row', gap: 8, marginTop: 6 },
  lvBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(232,197,71,0.15)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.35)',
  },
  lvText: { fontSize: 12, color: Colors.primary, fontWeight: '800', letterSpacing: 1 },
  elementTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  elementTagText: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500', letterSpacing: 1 },

  sideBtns: { position: 'absolute', right: 14, bottom: 170, zIndex: 5, gap: 14, alignItems: 'center' },
  sideBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(8,8,15,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.18)',
    shadowColor: '#E8C547', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  sideBtnPressed: { opacity: 0.4, transform: [{ scale: 0.88 }] },
  sideBtnIcon: { width: 32, height: 32, borderRadius: 8 },

  bottomFloat: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 28 : 10,
    left: 0, right: 0, zIndex: 5, paddingHorizontal: 14,
  },
  catRow: { gap: 12, marginBottom: 10, paddingHorizontal: 6 },
  catChip: { alignItems: 'center', gap: 4, paddingHorizontal: 2 },
  catIcon: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.15)',
    shadowColor: '#E8C547', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  catLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: Fonts.serif, letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputWrapper: {
    flex: 1, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(8,8,15,0.55)', borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.12)',
    justifyContent: 'center',
  },
  textInput: { height: 44, paddingHorizontal: 18, fontSize: 14, color: '#EDE4D0', fontFamily: Fonts.serif, letterSpacing: 0.5 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(232,197,71,0.15)', borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.30)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#E8C547', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  sendBtnText: { fontSize: 16, color: Colors.primary },
  sendBtnIcon: { width: 22, height: 22, opacity: 0.9 },

  animOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 50,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,5,8,0.7)',
  },
  animSpinner: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#A78BFA',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.06)',
    shadowColor: '#A78BFA', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  animSymbol: { fontSize: 44, color: '#A78BFA' },
  animText: { marginTop: 24, fontSize: 17, color: '#C4B5FD', fontFamily: Fonts.serif, letterSpacing: 5 },

  compassOverlay: { position: 'absolute', top: '22%', alignSelf: 'center', zIndex: 15, alignItems: 'center' },
  compassRing: {
    width: 170, height: 170, borderRadius: 85, borderWidth: 2.5, borderColor: 'rgba(74,222,128,0.5)',
    backgroundColor: 'rgba(8,8,15,0.55)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ADE80', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 0 },
  },
  compassDir: { fontSize: 15, color: '#4ADE80', fontFamily: Fonts.serif, fontWeight: '700', width: 20, textAlign: 'center' },
  compassNeedle: { width: 4, height: 84, alignItems: 'center' },
  needleN: { width: 4, height: 42, backgroundColor: '#4ADE80', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  needleS: { width: 4, height: 42, backgroundColor: 'rgba(255,255,255,0.15)', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  compassLocText: { marginTop: 10, fontSize: 13, color: '#4ADE80', fontFamily: Fonts.serif, letterSpacing: 2 },
  compassHint: { marginTop: 4, fontSize: 11, color: 'rgba(74,222,128,0.45)', fontFamily: Fonts.serif },

  divinationOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, alignItems: 'center', justifyContent: 'center' },
  divinationSpinner: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#A78BFA', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.08)' },
  divinationSymbol: { fontSize: 44, color: '#A78BFA' },
  divinationText: { marginTop: 20, fontSize: 16, color: '#C4B5FD', fontFamily: Fonts.serif, letterSpacing: 4 },
  featureOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: '30%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', zIndex: 25, borderWidth: 1, borderColor: 'rgba(232,197,71,0.10)' },
  overlayHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(232,197,71,0.25)', marginTop: 8, marginBottom: 4 },
});"""

content = content[:old_start] + new_styles + '\n'
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Styles rewritten! File now {len(content)} chars')
