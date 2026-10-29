<template>
  <q-page class="login-page">
    <!-- Left panel -->
    <div class="login-left">
      <div class="ll-inner">
        <div class="ll-logo">
          <q-icon name="las la-heartbeat" size="32px" color="white" />
          <span class="ll-brand">Clínica Alfavida</span>
        </div>
        <div class="ll-headline">Cuidar com<br />excelência.</div>
        <div class="ll-sub">Plataforma integrada de gestão clínica</div>
        <img src="~assets/medics.svg" class="ll-image" />
      </div>
    </div>

    <!-- Right panel -->
    <div class="login-right">
      <div class="lr-box">
        <img src="~assets/logo.png" class="lr-logo" />
        <div class="lr-title">Bem-vindo de volta</div>
        <div class="lr-subtitle">Introduza as suas credenciais para entrar</div>

        <q-form class="lr-form" autocomplete="off" @submit="login">
          <div class="lr-field">
            <label class="lr-label">Utilizador</label>
            <q-input
              v-model="form.username"
              class="fi"
              borderless
              :rules="[required]"
              placeholder="Nome de utilizador"
            >
              <template #prepend>
                <q-icon name="las la-user" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div class="lr-field">
            <label class="lr-label">Palavra-passe</label>
            <q-input
              v-model="form.password"
              class="fi"
              borderless
              :type="showPwd ? 'text' : 'password'"
              :rules="[required]"
              placeholder="••••••••"
            >
              <template #prepend>
                <q-icon name="las la-lock" size="18px" color="grey-5" />
              </template>
              <template #append>
                <q-icon
                  :name="showPwd ? 'las la-eye-slash' : 'las la-eye'"
                  size="18px"
                  color="grey-5"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            class="lr-btn full-width"
            label="Entrar"
            :loading="loading"
            type="submit"
            unelevated
            no-caps
          >
            <template #loading>
              <q-spinner-dots size="20px" />
            </template>
          </q-btn>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { required } from "src/utils/validation";
import { useAuth } from "src/composables/auth";

const { form, login, loading } = useAuth();
const showPwd = ref(false);
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  min-height: 100vh;
}

/* ── Left panel ── */
.login-left {
  flex: 1;
  background: linear-gradient(145deg, #0f9b6e 0%, #0d7a57 50%, #0a5e42 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -80px;
    right: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }
  &::after {
    content: "";
    position: absolute;
    bottom: -60px;
    left: -60px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
  }
}

.ll-inner {
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 100%;
}

.ll-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.ll-brand {
  font-size: var(--fs-heading); line-height: var(--lh-tight);
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.ll-headline {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.5px;
  margin-bottom: 14px;
}

.ll-sub {
  font-size: var(--fs-title); line-height: var(--lh-tight);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
}

.ll-image {
  width: 100%;
  max-width: 340px;
  opacity: 0.9;
  display: block;
}

/* ── Right panel ── */
.login-right {
  width: 440px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  padding: 48px 40px;
}

.lr-box {
  width: 100%;
  max-width: 340px;
}

.lr-logo {
  width: 80px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 28px;
  display: block;
}

.lr-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.lr-subtitle {
  font-size: var(--fs-body); line-height: var(--lh-body);
  color: var(--text-faint);
  margin-bottom: 32px;
}

.lr-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lr-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lr-label {
  font-size: var(--fs-label); line-height: var(--lh-tight);
  font-weight: 600;
  color: var(--text-3);
}

.lr-btn {
  margin-top: 8px;
  background: #0f9b6e;
  color: #fff;
  border-radius: var(--r-sm);
  font-size: var(--fs-title); line-height: var(--lh-tight);
  font-weight: 600;
  padding: 12px;
  transition: background 0.2s;

  &:hover { background: #0d8a61; }
}

/* ── Responsive ── */
@media (max-width: 700px) {
  .login-left { display: none; }
  .login-right { width: 100%; padding: 40px 24px; }
}
</style>
