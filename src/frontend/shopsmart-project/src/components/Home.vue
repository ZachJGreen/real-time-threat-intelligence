<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const login = () => {
  console.log('Logging in with:', email.value, password.value)
}

</script>

<template>
  <div class="login-container">
    <v-card elevation="10" class="login-card">
      <v-card-title class="text-center mb-4">
        <h2>Login into the App</h2>
      </v-card-title>

      <v-form @submit.prevent="login">
        <v-text-field
          v-model="email"
          label="Email"
          prepend-icon="mdi-email"
          type="email"
          required
        ></v-text-field>

        <v-text-field
            v-model="password"
            label="Password"
            prepend-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="showPassword = !showPassword"
            required
          ></v-text-field>

          <v-btn 
            type="submit" 
            color="primary"
            block         
            class="mt-4"     
          >
            Login
          </v-btn>
      </v-form>
    </v-card>
  </div>

</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  background-color: #000000;
  color: white;
}
</style>
